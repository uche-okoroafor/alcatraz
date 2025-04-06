import React, { createContext, useEffect, useState } from 'react';
import { socket } from '../connection/socketIo';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isStrategies, setIsStrategies] = useState(true);
  const [signalAlert, setSignalAlert] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

 useEffect(() => {
    // Listen for scanners
    socket.on("new-setup", (setUpdata) => {

    });

    // Clean up the effect on unmount
    return () => {
      socket.off("new-setup");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for new signals
    socket.on("signal-alert", (data) => {
      console.log('signal-alert', data)
      setSignalAlert(data); // Add to unread signals
    });

    // Clean up the effect
    return () => {
      socket.off("signal-alert");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        isStrategies,
        setIsStrategies,
        signalAlert,
        setSignalAlert,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
