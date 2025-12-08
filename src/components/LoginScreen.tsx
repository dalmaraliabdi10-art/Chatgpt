import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (userType: 'admin' | 'guest') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    // HÄR SÄTTER DU DIN PIN-KOD (t.ex. 1234)
    const SECRET_PIN = "1234"; 

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleClear = () => {
        setPin('');
        setError(false);
    };

    const handleEnter = () => {
        if (pin === SECRET_PIN) {
            onLogin('admin');
        } else {
            setError(true);
            setPin('');
            // Skaka-effekt eller rött ljus kan läggas till här
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>IDENTITY VERIFICATION</h2>
                
                <div className={`pin-display ${error ? 'error' : ''}`}>
                    {pin.padEnd(4, '•').replace(/./g, (char) => char === '•' ? '•' : '*')}
                </div>

                {error && <div className="access-denied">ACCESS DENIED</div>}

                <div className="keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleNumberClick(num.toString())}>
                            {num}
                        </button>
                    ))}
                    <button onClick={handleClear} className="func-btn">CLR</button>
                    <button onClick={() => handleNumberClick('0')}>0</button>
                    <button onClick={handleEnter} className="func-btn enter">ENT</button>
                </div>

                <div className="divider">OR</div>

                <button className="guest-btn" onClick={() => onLogin('guest')}>
                    CONTINUE AS GUEST
                </button>
            </div>
        </div>
    );
};