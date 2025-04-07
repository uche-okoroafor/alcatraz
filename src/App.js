import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import Router components and useNavigate
import { AppProvider, AppContext } from './context/AppContext'; // Import AppProvider and AppContext
import { Button, Typography } from '@mui/material';
import { Add, SwitchAccountOutlined } from '@mui/icons-material'; // Import SwitchAccountOutlined icon
import 'bootstrap/dist/css/bootstrap.min.css';
import StrategySetupCards from './components/StrategySetupCards';
import ScannerCards from './components/ScannerCards';
import StrategySetupForm from './components/StrategySetupForm';
import ScannerForm from './components/ScannerForm';
import logos from './asset/images/logo.png';
import './App.css'; // Import the CSS file
import SelectedSetupDetails from './components/StrategySetupDetails';
import ScannerDetails from './components/ScannerDetails';
import axios from 'axios'; // Import axios for making HTTP requests
import { SERVER_URL } from './endpoints';
import Notification from './components/Notification'; // Import the new component
import { socket } from './connection/socketIo';
import Chart from './components/Chart'; // Import the Chart component
import NavBar from './components/NavBar'; // Import NavBar
import FilterPopup from './components/FilterPopup'; // Import the new FilterPopup component


export default function App() {
  return (
    <AppProvider>
      <TradingDashboard />
    </AppProvider>
  );
}

function TradingDashboard() {
  const navigate = useNavigate(); // Initialize navigate

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [runningStrategy, setRunningStrategy] = useState([]);
  const [runningScanner, setRunningScanner] = useState([]);
  const [activeRunningStrategy, setActiveRunningStrategy] = useState({ errors: {} });
  const [activeRunningScanner, setActiveRunningScanner] = useState({ errors: {} });
  const [newAddedSetup, setNewAddedSetup] = useState(false);
  const [newSignals, setNewSignals] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [marketDownTime, setMarketDownTime] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false); // State for filter popup
  const [filterCriteria, setFilterCriteria] = useState({}); // State for filter criteria

  const { isStrategies, setIsStrategies, signalAlert, setSignalAlert, soundEnabled, setSoundEnabled } = useContext(AppContext); // Use context

  useEffect(() => {
    // Listen for new signals
    socket.on("running-strategy", (runningStrategyObj) => {
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

    // Clean up the effect on unmount
    return () => {
      socket.off("running-strategy");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for scanners
    socket.on("scanner-result", (runningScannerObj) => {
      const scannerId = runningScannerObj._id;
      setRunningScanner((prevRunningScanner) => {

        const tempArr = [...prevRunningScanner, scannerId];
        return tempArr;
      });

      handleUpdateActiveRunningScanner(runningScannerObj);

      setTimeout(() => {
        setRunningScanner((prevRunningScanner) => {
          return prevRunningScanner.filter((id) => id !== scannerId);
        });
      }, 5000);
    });

    // Clean up the effect on unmount
    return () => {
      socket.off("scanner-result");
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

  const handleUpdateActiveRunningScanner = (runningScannerObj) => {
    const tempObj = activeRunningScanner;

    tempObj[runningScannerObj._id] = {
      _id: runningScannerObj._id,
      time_interval: runningScannerObj.time_interval,
      last_active: new Date(),
      isRunning: true,
      failedRunCount: 0
    };

    setActiveRunningScanner(tempObj);
  };

  const hasError = () => {
    if (Object.keys(activeRunningStrategy.errors).length > 0 || serverError) {
      return 'blinking-dot-danger';
    } else if (marketDownTime) {
      return 'static-dot-inactive-market';
    }
    return 'static-dot-active';
  };

  const handleFilterApply = (criteria) => {
    setFilterCriteria(criteria);
    setFilterOpen(false);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="container py-3">
            {currentView === 'list' ? (
              <>
                <NavBar
                  logos={logos}
                  hasError={hasError}
                  signalAlert={signalAlert}
                  handleCardClick={handleCardClick}
                  setNewSignals={setNewSignals}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  setIsStrategies={setIsStrategies}
                  isStrategies={isStrategies}
                  setOpen={setOpen}
                  navigate={navigate}
                  setFilterOpen={setFilterOpen}
                />
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

                {isStrategies ? <StrategySetupCards
                  handleCardClick={handleCardClick}
                  setLoading={setLoading}
                  runningStrategy={runningStrategy}
                  newAddedSetup={newAddedSetup}
                  activeRunningStrategy={activeRunningStrategy}
                  setActiveRunningStrategy={setActiveRunningStrategy}
                  newSignals={newSignals}
                  filterCriteria={filterCriteria} // Pass filter criteria to StrategySetupCards
                /> :
                  <ScannerCards
                    handleCardClick={handleCardClick}
                    setLoading={setLoading}
                    runningScanner={runningScanner}
                    newAddedSetup={newAddedSetup}
                    activeRunningScanner={activeRunningScanner}
                    setActiveRunningScanner={setActiveRunningScanner}
                  />}

                {isStrategies ? <StrategySetupForm
                  open={open}
                  onClose={() => setOpen(false)}
                  setOpen={setOpen}
                  onUpdate={setNewAddedSetup}
                /> : <ScannerForm
                  open={open}
                  onClose={() => setOpen(false)}
                  setOpen={setOpen}
                  onUpdate={setNewAddedSetup}
                />}
              </>
            ) : (
              <div>
                <Button
                  variant="outlined"
                  sx={{ marginLeft: '20px', borderColor: '#2fa8f6', color: '#2fa8f6' }}
                  onClick={handleBackClick}
                  className="mb-4"
                >Back to Setup</Button>
                {isStrategies ?
                  <SelectedSetupDetails
                    selectedSetup={selectedSetup}
                    onUpdate={setNewAddedSetup}
                    runningStrategy={runningStrategy}
                    activeRunningStrategy={activeRunningStrategy}
                  /> :
                  <ScannerDetails
                    selectedSetup={selectedSetup}
                    onUpdate={setNewAddedSetup}
                    runningScanner={runningScanner}
                    activeRunningScanner={activeRunningScanner}
                  />
                }
              </div>
            )}
            <FilterPopup
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              onApply={handleFilterApply}
            />
          </div>
        }
      />
      <Route path="/chart" element={<Chart setChartOpen={() => { }} focusedSetup={null} signals={[]} />} />
      <Route path="/setups" element={<StrategySetupCards
        handleCardClick={handleCardClick}
        setLoading={setLoading}
        runningStrategy={runningStrategy}
        newAddedSetup={newAddedSetup}
        activeRunningStrategy={activeRunningStrategy}
        setActiveRunningStrategy={setActiveRunningStrategy}
        newSignals={newSignals}
      />} />
      <Route path="/scanners" element={<ScannerCards
        handleCardClick={handleCardClick}
        setLoading={setLoading}
        runningScanner={runningScanner}
        newAddedSetup={newAddedSetup}
        activeRunningScanner={activeRunningScanner}
        setActiveRunningScanner={setActiveRunningScanner}
        newSignals={newSignals}
      />} />
    </Routes>
  );
}