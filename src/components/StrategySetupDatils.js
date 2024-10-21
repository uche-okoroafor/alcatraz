import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { Card, CardContent, Typography, Button, CardHeader } from '@mui/material';
import SignalsTable from './SignalsTable';
import StrategySetupForm from './StrategySetupForm';
import setupApi from '../api/setupApi';

const SelectedSetupDetails = ({ selectedSetup, onUpdate, runningStrategy, activeRunningStrategy }) => {
    const [open, setOpen] = useState(false);
    const [initialSetup, setInitialSetup] = useState(null);
    const [focusedSetup, setFocusedSetup] = useState(null);
    const [previousSelectedSetup, setPreviousSelectedSetup] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const setupId = selectedSetup?._id;
            if (setupId) {
                const { data } = await setupApi.getDetails(setupId);
                setFocusedSetup(data);
                setPreviousSelectedSetup(selectedSetup);
            }
        }

        if (selectedSetup?._id !== previousSelectedSetup?._id) {
            fetchData();
            setFocusedSetup(selectedSetup);
        }
    }, [previousSelectedSetup?._id, selectedSetup]);

    const handleEditClick = () => {
        setInitialSetup(focusedSetup);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getStatusIcon = (setup) => {
        if (!setup?.is_active) {
            return 'static-dot-inactive'
        } else if (setup?.is_active && activeRunningStrategy[setup._id]?.isRunning) {
            return "blinking-dot"
        } else if (setup?.is_active && activeRunningStrategy[setup._id]?.isRunning === undefined) {
            return 'static-dot-pending'
        } else if (setup?.is_active && !activeRunningStrategy[setup._id]?.isRunning) {
            return "blinking-dot-error"
        }
    }

    const runError = () => {
        if (activeRunningStrategy?.errors[focusedSetup?._id]) {
            console.log(activeRunningStrategy?.errors[focusedSetup?._id])
            return 'blinking-dot-danger'
        }
        return false;
    }

    return (
        <div>
            <Card sx={{ position: 'relative' }}>
                <CardHeader
                    title={focusedSetup?.name}
                    action={<div className={runError() || getStatusIcon(focusedSetup)}></div>}
                    sx={{ paddingBottom: '0px' }}
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Id:</strong> {focusedSetup?._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Strategy:</strong> {focusedSetup?.strategy_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Asset</strong> {focusedSetup?.target_asset}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Current Price</strong> {focusedSetup?.current_price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Timeframe:</strong> {focusedSetup?.time_interval}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Run Count:</strong> {focusedSetup?.run_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Last Run Time:</strong>
                        {' '} {moment(focusedSetup?.last_active).format('MMMM Do YYYY, h:mm:ss A')}
                    </Typography>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button className='mt-2' variant="contained" onClick={handleEditClick} style={{ backgroundColor: '#3FB923' }}>
                            Edit
                        </Button>
                    </div>
                    {runningStrategy.includes(focusedSetup?._id) && (
                        <div className={`progress mt-2 ${runningStrategy.includes(focusedSetup?._id) ? '' : 'progress-hidden'}`}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                aria-valuenow="75"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className='mt-3'>
                <SignalsTable selectedSetup={selectedSetup} />
            </div>
            <StrategySetupForm
                open={open}
                onClose={handleClose}
                setOpen={setOpen}
                initialSetup={initialSetup}
                setInitialSetup={setInitialSetup}
                setFocusedSetup={setFocusedSetup}
                onUpdate={onUpdate}
            />
        </div>
    );
};

export default SelectedSetupDetails;