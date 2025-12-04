import React from 'react';
import { ChatGpt } from './components/ChatGpt';
import reactLogo from './assets/logo.png';


const App: React.FC = () => {
  return (
    <>
      <div className="row">
        <div className="col-12 text-center">
          <img src={reactLogo} className="img-fluid w-25" alt="React logo" />
          <h1 className='display-1'>ReactoBot</h1>
        </div>
      </div>
      <ChatGpt />
    </>
  );
};

export default App;
