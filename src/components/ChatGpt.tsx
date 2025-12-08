import React, { useEffect, useState, useRef } from 'react';
import OpenAI from 'openai';
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import robotAnimation from '../assets/AI Robot.json';
import { ResponseMessageProps } from '../models/ResponseMessageProps';

export const ChatGpt: React.FC = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [responseMessages, setResponseMessages] = useState<Array<ResponseMessageProps>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [nerveTrigger, setNerveTrigger] = useState<boolean>(false);
    
    // Referens till Lottie-spelaren för att kunna styra hastighet/paus
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Initiera OpenAI
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const getOpenAIResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage) return;

        const currentInput = inputMessage;
        setInputMessage(''); // Rensa direkt

        // 1. Trigga nerv-animationen
        setNerveTrigger(true);
        setTimeout(() => setNerveTrigger(false), 1000); // Återställ efter 1s (animationens tid)

        // Lägg till användarens meddelande i listan
        const newUserMsg = { message: currentInput, user: 'user', timestamp: new Date() };
        setResponseMessages(prev => [newUserMsg, ...prev]); // Lägg nya överst för flex-reverse layout

        setLoading(true);

        try {
            // Anropa OpenAI
            const stream = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are Jarvis, a helpful AI assistant.' },
                    { role: 'user', content: currentInput }
                ],
                model: 'gpt-4',
                stream: true,
            });

            let aiResponseText = "";
            
            // Skapa ett placeholder-meddelande för AI
            const aiMsgId = Date.now();
            setResponseMessages(prev => [{ message: "Processing...", user: 'chatgpt', timestamp: new Date(), id: aiMsgId }, ...prev]);

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                aiResponseText += content;
                
                // Uppdatera det senaste meddelandet i realtid
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

    // Styr roboten baserat på loading-status
    useEffect(() => {
        if (lottieRef.current) {
            if (loading) {
                lottieRef.current.setSpeed(1.5); // Pratar/Tänker snabbt
            } else {
                lottieRef.current.setSpeed(0.5); // Idle / Andas långsamt
            }
        }
    }, [loading]);

    return (
        <div className="scifi-container">
            
            {/* --- 1. ROBOT (CENTER) --- */}
            <div className={`robot-wrapper ${loading ? 'robot-talking' : ''}`}>
                <Lottie 
                    lottieRef={lottieRef}
                    animationData={robotAnimation} 
                    loop={true} 
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* --- 2. NERV-SIGNAL (Animeras vid skick) --- */}
            <div className={`nerve-signal ${nerveTrigger ? 'nerve-active' : ''}`}></div>

            {/* --- 3. CHAT HISTORIK (Flytande bakom/över) --- */}
            <div className="chat-history">
                {/* Vi mappar igenom listan. Eftersom vi använder flex-col-reverse i CSS kommer första elementet hamna längst ner */}
                {responseMessages.map((msg, index) => (
                    <div key={index} className={`scifi-msg ${msg.user === 'user' ? 'user' : 'ai'}`}>
                        <strong>{msg.user === 'user' ? 'COMMAND > ' : 'SYSTEM: '}</strong>
                        {msg.message}
                    </div>
                ))}
            </div>

            {/* --- 4. INPUT TERMINAL --- */}
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