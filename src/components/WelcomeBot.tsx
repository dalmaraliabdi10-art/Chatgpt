import React from 'react';
import Lottie from "lottie-react";

// VIKTIGT: Importera din json-fil här.
// Se till att sökvägen stämmer till var du lade filen.
import robotAnimation from '../assets/AI Robot.json';

const WelcomeBot: React.FC = () => {

  // Inställningar för animationen
  const defaultOptions = {
    loop: true, // Sätt till 'false' om den bara ska vinka en gång
    autoplay: true, 
    animationData: robotAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div className="welcome-container" style={styles.container}>
       {/* Själva robot-animationen */}
       <div style={styles.robotWrapper}>
          <Lottie {...defaultOptions} />
       </div>

       {/* Välkomst-texten */}
       <h2 style={styles.welcomeText}>Welcome.</h2>
       <p style={styles.subText}>System online. Ready for input.</p>
    </div>
  );
};

// Vi lägger in lite enkel CSS direkt här (inline styles) för att testa snabbt.
// Du kan flytta detta till din .scss-fil senare om du vill.
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        backgroundColor: 'rgba(0, 20, 40, 0.5)', // Lite genomskinlig mörk bakgrund
        borderRadius: '15px',
        border: '1px solid #00E5FF', // Sci-fi cyan kant
        marginBottom: '20px',
    },
    robotWrapper: {
        width: '180px', // ÄNDRA HÄR för att göra roboten större/mindre
        height: '180px',
    },
    welcomeText: {
        color: '#00E5FF', // Neon-cyan färg
        fontFamily: '"Courier New", Courier, monospace', // Sci-fi typsnitt
        textTransform: 'uppercase' as 'uppercase',
        letterSpacing: '2px',
        marginTop: '15px',
        marginBottom: '5px',
    },
    subText: {
        color: '#8899A6',
        fontSize: '0.9rem',
        fontFamily: '"Courier New", Courier, monospace',
    }
};

export default WelcomeBot;