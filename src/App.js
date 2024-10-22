import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import StrategySetupCards from './components/StrategySetupCards';
import StrategySetupForm from './components/StrategySetupForm';
import logos from './asset/images/logo.png';
import './App.css'; // Import the CSS file
import SelectedSetupDetails from './components/StrategySetupDatils';
import io from "socket.io-client";
import axios from 'axios'; // Import axios for making HTTP requests
import { SERVER_URL, SOCKET_IO_URL } from './endpoints';
import Notification from './components/Notification'; // Import the new component

const socket = io(SOCKET_IO_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default function TradingDashboard() {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [runningStrategy, setRunningStrategy] = useState([]);
  const [activeRunningStrategy, setActiveRunningStrategy] = useState({ errors: {} });
  const [newAddedSetup, setNewAddedSetup] = useState(false);
  const [newSignals, setNewSignals] = useState({});
  const [serverError, setServerError] = useState(false);
  const [marketDownTime, setMarketDownTime] = useState(false);
  const [signalAlert, setSignalAlert] = useState([]); // State for unread signals

  useEffect(() => {
    // Listen for new signals
    socket.on("running-strategy", (runningStrategyObj) => {
      console.log('running-strategy')
      setRunningStrategy((prevRunningStrategy) => {
        const tempArr = [...prevRunningStrategy, runningStrategyObj._id];
        return tempArr;
      });

      handleUpdateActiveRunningStrategy(runningStrategyObj);

      setTimeout(() => {
        setRunningStrategy((prevRunningStrategy) => {
          return prevRunningStrategy.filter((id) => id !== runningStrategyObj._id);
        });
      }, 5000);
    });

    // Clean up the effect
    return () => {
      socket.off("running-strategy");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for new signals
    socket.on("error-alert", (errorData) => {
      console.log(errorData, 'error-alert')
      const tempObj = activeRunningStrategy;
      tempObj.errors[errorData.setupId] = errorData;
      setActiveRunningStrategy(tempObj);
      console.log(activeRunningStrategy.errors, 'error-alert');
    });

    // Clean up the effect
    return () => {
      socket.off("error-alert");
    };
  });

  useEffect(() => {
    // Listen for new signals
    socket.on("signal-alert", (data) => {
      console.log('signal-alert')
      const tempObj = newSignals;
      tempObj[data.setupId] = data;
      setNewSignals(tempObj);
      setSignalAlert(data); // Add to unread signals
    });

    // Clean up the effect
    return () => {
      socket.off("signal-alert");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for new signals
    socket.on("market-down-time", (data) => {
      console.log(data, 'market-down-time')
      setMarketDownTime(data.is_market_down);
    });

    // Clean up the effect
    return () => {
      socket.off("market-down-time");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Function to check the server
    const checkServer = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/health-check`);
        response.status === 200 ? setServerError(false) : setServerError(true);
      } catch (error) {
        console.log(error);
        setServerError(true);
      }
    };

    checkServer();

    // Set up an interval to check the server every 5 minutes (300000 milliseconds)
    const interval = setInterval(checkServer, 120000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (setup) => {
    setSelectedSetup(setup);
    setCurrentView('details');
  };

  const handleBackClick = () => {
    setCurrentView('list');
    setSelectedSetup(null);
  };

  const handleUpdateActiveRunningStrategy = (runningStrategyObj) => {
    const tempObj = activeRunningStrategy;

    tempObj[runningStrategyObj._id] = {
      _id: runningStrategyObj._id,
      time_interval: runningStrategyObj.time_interval,
      last_active: new Date(),
      isRunning: true,
      failedRunCount: 0
    };

    setActiveRunningStrategy(tempObj);
  };

  const hasError = () => {
    if (Object.keys(activeRunningStrategy.errors).length > 0 || serverError) {
      return 'blinking-dot-danger';
    } else if (marketDownTime) {
      return 'static-dot-inactive-market';
    }
    return 'static-dot-active';
  };

  return (
    <div className="container py-3">
      {currentView === 'list' ? (
        <>
          <div className='patch1'></div>
          <div className="sticky-header">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
              <img src={logos} className='mr-3' alt="Trading Strategies" style={{ width: '50px', height: 'auto', borderRadius: '50%', marginRight: '10px' }} />
              <Typography variant="h6" component="h6" style={{ color: 'white' }}>
                Alcatraz
              </Typography>
              <div className={hasError()}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Notification
                signalAlert={signalAlert}
                handleCardClick={handleCardClick}
              />
              <Button
                variant="contained"
                sx={{ marginLeft: '20px' }}
                startIcon={<Add />}
                onClick={() => setOpen(true)}
                style={{ backgroundColor: '#2fa8f6' }}
              >
                Add Setup
              </Button>
            </div>
          </div>

          {loading && (
            <div className="d-flex justify-content-center align-items-center"
              style={{
                position: 'fixed',
                top: '40%',
                left: 0,
                right: 0,
                zIndex: 9999,
              }}
            >
              <div className="spinner-border" role="status"
                style={{
                  width: '100px',
                  height: '100px',
                  color: '#2fa8f6'
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          <StrategySetupCards
            handleCardClick={handleCardClick}
            setLoading={setLoading}
            runningStrategy={runningStrategy}
            newAddedSetup={newAddedSetup}
            activeRunningStrategy={activeRunningStrategy}
            setActiveRunningStrategy={setActiveRunningStrategy}
            newSignals={newSignals}
          />

          <StrategySetupForm
            open={open}
            onClose={() => setOpen(false)}
            setOpen={setOpen}
            onUpdate={setNewAddedSetup}
          />
        </>
      ) : (
        <div>
          <Button variant="contained" onClick={handleBackClick} className="mb-4" style={{ backgroundColor: '#2fa8f6' }}>Back to Setup</Button>
          <SelectedSetupDetails
            selectedSetup={selectedSetup}
            onUpdate={setNewAddedSetup}
            runningStrategy={runningStrategy}
            activeRunningStrategy={activeRunningStrategy}
          />
        </div>
      )}
    </div>
  );
}