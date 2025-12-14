import React, { useEffect, useState, useRef } from 'react';
import OpenAI from 'openai';
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import robotAnimation from '../assets/AI Robot.json';
import { ResponseMessageProps } from '../models/ResponseMessageProps';

// --- TYP-DEFINITIONER FÖR RÖST (Web Speech API) ---
// Detta behövs för att TypeScript inte ska klaga på 'webkitSpeechRecognition'
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface ChatGptProps {
    userType: 'admin' | 'guest' | null;
    onLogout: () => void;
}

export const ChatGpt: React.FC<ChatGptProps> = ({ userType, onLogout }) => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [responseMessages, setResponseMessages] = useState<Array<ResponseMessageProps>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [nerveTrigger, setNerveTrigger] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false); // Ny state för mikrofon
    
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // --- LOGIK FÖR ATT SPARA/HÄMTA CHATT ---
    useEffect(() => {
        if (userType === 'admin') {
            const savedChat = localStorage.getItem('scifi_admin_chat');
            if (savedChat) {
                const parsed = JSON.parse(savedChat).map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setResponseMessages(parsed);
            }
        } else {
            setResponseMessages([]);
        }
    }, [userType]);

    useEffect(() => {
        if (userType === 'admin' && responseMessages.length > 0) {
            localStorage.setItem('scifi_admin_chat', JSON.stringify(responseMessages));
        }
    }, [responseMessages, userType]);

    // --- RÖST-FUNKTIONER (NYTT) ---
    
    // 1. Få Void att prata (Text-to-Speech)
    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        // Stoppa om den redan pratar
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Sätt till 'sv-SE' om du vill att Void pratar svenska
        utterance.pitch = 0.8;    // Lite mörkare röst för robot-känsla
        utterance.rate = 1.1;     // Lite snabbare
        
        // Hitta en bra röst om möjligt
        const voices = window.speechSynthesis.getVoices();
        const robotVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha'));
        if (robotVoice) utterance.voice = robotVoice;

        window.speechSynthesis.speak(utterance);
    };

    // 2. Lyssna på dig (Speech-to-Text)
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Din webbläsare stödjer inte röstigenkänning (testa Chrome).");
            return;
        }

        const SpeechRecognition = window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US'; // Ändra till 'sv-SE' för svenska
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
            setIsListening(false);
            
            // Valfritt: Skicka meddelandet direkt när du slutat prata:
            // handleAutoSend(transcript); 
        };

        recognition.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // --- OPENAI CHAT LOGIK ---
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const getOpenAIResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage) return;

        // Stoppa ev. pågående tal när du skickar nytt
        window.speechSynthesis.cancel();

        const currentInput = inputMessage;
        setInputMessage(''); 

        setNerveTrigger(true);
        setTimeout(() => setNerveTrigger(false), 1000); 

        const newUserMsg = { message: currentInput, user: 'user', timestamp: new Date() };
        setResponseMessages(prev => [newUserMsg, ...prev]); 

        setLoading(true);

        try {
            const conversationHistory = responseMessages.slice().reverse().map(msg => ({
                role: (msg.user === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                content: msg.message
            }));

            const stream = await openai.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        // --- HÄR ÄR "INLÄRNINGEN" ---
                        content: `You are Void, an advanced personal AI assistant. 
                                  You are efficient, helpful, and intelligent.
                                  Important: Adapt to the user's speaking style and tone. 
                                  If the user is casual, be casual. If they are formal, be formal.
                                  Learn from the conversation history how the user prefers to communicate.` 
                    },
                    ...conversationHistory,
                    { role: 'user', content: currentInput }
                ],
                model: 'gpt-4',
                stream: true,
            });

            let aiResponseText = "";
            const aiMsgId = Date.now();
            setResponseMessages(prev => [{ message: "Processing...", user: 'chatgpt', timestamp: new Date(), id: aiMsgId }, ...prev]);

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                aiResponseText += content;
                
                setResponseMessages(prev => {
                    const newList = [...prev];
                    newList[0] = { ...newList[0], message: aiResponseText };
                    return newList;
                });
            }

            // När hela svaret är klart - Läs upp det!
            speakText(aiResponseText);

        } catch (error) {
            console.error(error);
            setResponseMessages(prev => [{ message: "Error: Neural link disrupted.", user: 'chatgpt', timestamp: new Date() }, ...prev]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lottieRef.current) {
            if (loading) {
                lottieRef.current.setSpeed(1.5); 
            } else {
                lottieRef.current.setSpeed(0.5); 
            }
        }
    }, [loading]);

    const clearHistory = () => {
        setResponseMessages([]);
        if(userType === 'admin') localStorage.removeItem('scifi_admin_chat');
    }

    return (
        <div className="scifi-container">
            
            {/* LOGOUT */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, display: 'flex', gap: '10px' }}>
                <div style={{color: '#00f0ff', border: '1px solid #00f0ff', padding: '5px 10px', fontSize: '0.8rem'}}>
                    USER: {userType?.toUpperCase()}
                </div>
                {userType === 'admin' && (
                    <button onClick={clearHistory} style={{background: 'transparent', color: 'red', border: '1px solid red', cursor: 'pointer'}}>
                        PURGE MEMORY
                    </button>
                )}
                <button onClick={onLogout} style={{background: '#00f0ff', border: 'none', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold'}}>
                    LOGOUT
                </button>
            </div>

            <div className={`robot-wrapper ${loading ? 'robot-talking' : ''}`}>
                <Lottie 
                    lottieRef={lottieRef}
                    animationData={robotAnimation} 
                    loop={true} 
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            <div className={`nerve-signal ${nerveTrigger ? 'nerve-active' : ''}`}></div>

            <div className="chat-history">
                {responseMessages.map((msg, index) => (
                    <div key={index} className={`scifi-msg ${msg.user === 'user' ? 'user' : 'ai'}`}>
                        <strong>{msg.user === 'user' ? 'COMMAND > ' : 'Void: '}</strong>
                        {msg.message}
                    </div>
                ))}
            </div>

            <form onSubmit={getOpenAIResponse} className="input-area" style={{display: 'flex', gap: '10px'}}>
                {/* --- MIKROFON KNAPP --- */}
                <button 
                    type="button" 
                    onClick={startListening}
                    style={{
                        background: isListening ? 'red' : 'transparent',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        cursor: 'pointer',
                        padding: '0 15px',
                        fontSize: '1.2rem',
                        animation: isListening ? 'pulse 1s infinite' : 'none'
                    }}
                    title="Activate Voice Link"
                >
                    {isListening ? '●' : '🎤'}
                </button>

                <input
                    type="text"
                    className="scifi-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="ENTER COMMAND..."
                    autoFocus
                    style={{flex: 1}}
                />
            </form>
            
            {/* Lägg till en enkel keyframe animation för inspelning om du vill i din CSS, annars funkar det ändå */}
            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
                }
            `}</style>
        </div>
    );
};