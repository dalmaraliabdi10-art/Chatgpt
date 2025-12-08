import React from 'react';
import { ChatGpt } from './components/ChatGpt';

const App: React.FC = () => {
  return (
    // Vi använder reset-stilar här för att garantera att den tar hela skärmen utan marginaler
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <ChatGpt />
    </div>
  );
};

export default App;