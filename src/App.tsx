import React, { useState } from 'react';
import { ChatGpt } from './components/ChatGpt';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'guest' | null>(null);

  const handleLogin = (type: 'admin' | 'guest') => {
    setUserType(type);
    setIsLoggedIn(true);
  }; // Hanterar inloggning och sätter användartyp

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
  }; // Hanterar utloggning och återställer användartyp

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatGpt userType={userType} onLogout={handleLogout} />
      )}
    </div>
  ); // Renderar antingen inloggningsskärmen eller chattkomponenten baserat på inloggningsstatus
}; // Huvudkomponenten för appen

export default App; // Exporterar huvudkomponenten så den kan användas i andra delar av appen