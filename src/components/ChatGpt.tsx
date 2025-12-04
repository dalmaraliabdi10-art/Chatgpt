import React from 'react';
import OpenAI from 'openai';
import texting from '../assets/icons8-chat.gif';
import ResponseMessage from './ResponseMessage';
import { ResponseMessageProps } from '../models/ResponseMessageProps';

export const ChatGpt: React.FC = () => {
    const [inputMessage, setInputMessage] = React.useState<string>('');
    const [responseMessages, setResponseMessages] = React.useState<Array<ResponseMessageProps>>([]);
    const [responseMessage, setResponseMessage] = React.useState<ResponseMessageProps>({});

    const [loading, setLoading] = React.useState<boolean>(false);

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const getOpenAIResponse = async (e: React.FormEvent<EventTarget>) => {
        e.preventDefault();

        // If responseMessage is not empty, add it to responseMessages
        if (responseMessage?.message && responseMessage.message.length > 0) {
            setResponseMessages(prevMessages => [
                ...prevMessages,
                responseMessage
            ]);
        }
        setResponseMessage({});

        // Add inputmessage to responseMessages
        setResponseMessages(prevMessages => [
            ...prevMessages,
            { message: inputMessage, user: 'user', timestamp: new Date() }
        ]);

        
        // Start openAI chat
        const stream = await openai.chat.completions.create(
            {
                messages: [
                    { role: 'assistant', content: 'Du är konfigurerad som en hjälpsam assistent med namnet ReactoBot. Dina svar bör efterlikna stilen och fraserna som används av Jarvis i Iron Man-filmerna. Till exempel bör du använda fraser som "God kväll, Mäsaten" i dina interaktioner. Din huvudsakliga funktion är att svara på alla frågor och kommandon på ett sätt som är konsekvent med Jarvis karaktär från filmerna, samtidigt som du upprätthåller ett artigt, effektivt och stödjande uppförande genom hela dialogen.' },
                    { role: 'user', content: inputMessage || '' }
                ],
                model: 'gpt-4',
                stream: true
            }
        );

        // Start a stream and get the response
        setLoading(true);
        setResponseMessage({ message: '', user: 'chatgpt', timestamp: new Date() });
        for await (const chunk of stream) {
            setResponseMessage((prevMessage) => ({
                ...prevMessage,
                message: (prevMessage.message || '') + (chunk.choices[0]?.delta?.content || ''),
            }));

        }

        setInputMessage('');
        setLoading(false);

    };

    const resetChat = () => {
        setResponseMessages([]);
        setResponseMessage({});
    }

    return (
        <>
            {responseMessages.map((response, index) => (
                <ResponseMessage key={index} message={response.message} user={response.user} timestamp={response.timestamp} />
            ))}

            {responseMessage?.message && responseMessage.message.length > 0 &&
                <ResponseMessage message={responseMessage.message} user={responseMessage.user} timestamp={responseMessage.timestamp} />
            }
            {loading &&
                <div className='row'>
                    <div className='col-12'>
                        <img src={texting} />
                    </div>
                </div>
            }
            <form onSubmit={getOpenAIResponse} className='row' >
                <div className='form-floating mb-3'>
                    
                    <textarea
                        id="chat-input"
                        rows={5}
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        className='form-control form-control-lg'
                        placeholder='Skriv något till...'
                        required
                    />
                    <label className="form-label">Skriv ett meddelande här</label>
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                        className='btn btn-primary btn-lg m-3'
                        type="submit">Skicka meddelande</button>

                    {responseMessages.length > 0 &&
                        <button
                            onClick={resetChat}
                            className='btn btn-secondary btn-lg m-3'
                            disabled={responseMessages.length > 0 ? false : true}
                            type="reset">Återställ dialog</button>
                    }
                </div>
            </form>

        </>
    );
};
