import React from 'react';
import { Button, Typography } from '@mui/material';
import { Add, SwitchAccountOutlined } from '@mui/icons-material';
import Notification from './Notification';

const NavBar = ({
  logos,
  hasError,
  signalAlert,
  handleCardClick,
  setNewSignals,
  soundEnabled,
  setSoundEnabled,
  setIsStrategies,
  isStrategies,
  setOpen,
  navigate,
  setFilterOpen
}) => {
  return (
    <div className="sticky-header">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <img src={logos} className="mr-3" alt="Trading Strategies" style={{ width: '50px', height: 'auto', borderRadius: '50%', marginRight: '10px' }} />
        <Typography variant="h6" component="h6" style={{ color: 'white' }}>
          Alcatraz
        </Typography>
        <div className={hasError()}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Notification
          signalAlert={signalAlert}
          handleCardClick={handleCardClick}
          setNewSignals={setNewSignals}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        <Button
          variant="outlined"
          sx={{ marginLeft: '20px', borderColor: '#2fa8f6', color: '#2fa8f6' }}
          startIcon={<SwitchAccountOutlined />}
          onClick={() => setIsStrategies(!isStrategies)}
        >
          {isStrategies ? 'Scanner' : 'Strategies'}
        </Button>
        <Button
          variant="outlined"
          sx={{ marginLeft: '20px', borderColor: '#2fa8f6', color: '#2fa8f6' }}
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          {isStrategies ? 'Add Setup' : 'Add Scanner'}
        </Button>
        <Button
          variant="outlined"
          sx={{ marginLeft: '20px', borderColor: '#2fa8f6', color: '#2fa8f6' }}
          onClick={() => navigate('/chart')}
        >
          Go to Chart
        </Button>
        <Button
          variant="outlined"
          sx={{ marginLeft: '20px', borderColor: '#2fa8f6', color: '#2fa8f6' }}
          onClick={() => setFilterOpen(true)}
        >
          Filter
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
