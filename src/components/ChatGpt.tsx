import React, { useEffect, useState, useRef } from 'react';
import OpenAI from 'openai';
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import robotAnimation from '../assets/AI Robot.json';
import { ResponseMessageProps } from '../models/ResponseMessageProps';

// Lägg till props interface
interface ChatGptProps {
    userType: 'admin' | 'guest' | null;
    onLogout: () => void;
}

export const ChatGpt: React.FC<ChatGptProps> = ({ userType, onLogout }) => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [responseMessages, setResponseMessages] = useState<Array<ResponseMessageProps>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [nerveTrigger, setNerveTrigger] = useState<boolean>(false);
    
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // --- LOGIK FÖR ATT SPARA/HÄMTA CHATT ---
    useEffect(() => {
        if (userType === 'admin') {
            // Om Admin: Hämta sparad historik
            const savedChat = localStorage.getItem('scifi_admin_chat');
            if (savedChat) {
                // Vi måste konvertera datum-strängar tillbaka till Date-objekt
                const parsed = JSON.parse(savedChat).map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setResponseMessages(parsed);
            }
        } else {
            // Om Gäst: Börja tomt (eller rensa om man vill vara säker)
            setResponseMessages([]);
        }
    }, [userType]);

    // Spara chatten varje gång den ändras (BARA FÖR ADMIN)
    useEffect(() => {
        if (userType === 'admin' && responseMessages.length > 0) {
            localStorage.setItem('scifi_admin_chat', JSON.stringify(responseMessages));
        }
    }, [responseMessages, userType]);
    // ----------------------------------------

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const getOpenAIResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage) return;

        const currentInput = inputMessage;
        setInputMessage(''); 

        setNerveTrigger(true);
        setTimeout(() => setNerveTrigger(false), 1000); 

        const newUserMsg = { message: currentInput, user: 'user', timestamp: new Date() };
        // Uppdatera state (vilket triggar spara-effekten ovan om admin)
        setResponseMessages(prev => [newUserMsg, ...prev]); 

        setLoading(true);

        try {
            const stream = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are Jarvis, a helpful AI assistant.' },
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

    // Rensa historik-funktion (bra för admin att ha)
    const clearHistory = () => {
        setResponseMessages([]);
        if(userType === 'admin') localStorage.removeItem('scifi_admin_chat');
    }

    return (
        <div className="scifi-container">
            
            {/* LOGOUT / HEADER INFO */}
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
                        <strong>{msg.user === 'user' ? 'COMMAND > ' : 'SYSTEM: '}</strong>
                        {msg.message}
                    </div>
                ))}
            </div>

            <form onSubmit={getOpenAIResponse} className="input-area">
                <input
                    type="text"
                    className="scifi-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="ENTER COMMAND..."
                    autoFocus
                />
            </form>
        </div>
    );
};