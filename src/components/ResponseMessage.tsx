import { ResponseMessageProps } from '../models/ResponseMessageProps';
import { useEffect, useState } from 'react';

const ResponseMessage = ({ message, user, timestamp }: ResponseMessageProps) => {
    const userUrl = 'https://api.dicebear.com/7.x/adventurer/png?seed=' + user;
    const bottts = 'https://api.dicebear.com/7.x/bottts/png?seed=' + user;

    useEffect(() => {
        if (!timestamp) return;

        const timer = setInterval(() => {
            setTimeAgo(getTimestamp(timestamp));
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [timestamp]);

    const getTimestamp = (date: Date) => { // Funktion för att formatera tidsskillnad
        const elapsed = new Date().getTime() - date.getTime();
        const seconds = Math.floor(elapsed / 1000);

        let interval = seconds / 31536000;

        if (interval > 1) {
            return Math.floor(interval) + " år sedan";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " månader sedan";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " dagar sedan";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " timmar sedan";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minuter sedan";
        }
        return Math.floor(seconds) + " sekunder sedan";
    }

    const [timeAgo, setTimeAgo] = useState(timestamp ? getTimestamp(timestamp) : ''); // State för att lagra den formaterade tidsskillnaden

    return ( 
        <>
            <div className="card mb-3" >
                <div className="row g-0">
                    {user && user == 'user' &&
                        <div className="col-md-4">
                            <img src={userUrl} className="img-fluid figure-img" alt={user} />
                        </div>
                    }
                    <div className="col-md-8">
                        <div className="card-body">
                            <h5 className="card-title">{user}</h5>
                            <p className="card-text">{message?.replace('undefined', '') || ''}</p>
                            <p className="card-text"><small className="text-muted">skickades för {timeAgo}</small></p>
                        </div>
                    </div>
                    {user && user == 'chatgpt' &&
                        <div className="col-md-4">
                            <img src={bottts} className="img-fluid figure-img" alt={user} />
                        </div>
                    }
                </div>
            </div>

        </>
    ); // JSX returnerar meddelandet med användarens avatar och tidsskillnad
}
export default ResponseMessage; // Exporterar komponenten så den kan användas i andra delar av appen