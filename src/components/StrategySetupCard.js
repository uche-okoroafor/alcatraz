import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import setupApi from '../api/setupApi';
import { calculateTimeout } from '../helpers';


const StrategySetupCard = (props) => {
    const { setLoading, handleCardClick, runningStrategy, newAddedSetup, activeRunningStrategy, setActiveRunningStrategy, newSignals } = props;
    const [setups, setSetups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSetups, setTotalSetups] = useState(0);
    const [isActiveRunningStrategyUpdated, setIsActiveRunningStrategyUpdated] = useState(false);
    const pageSize = 9;


    useEffect(() => {
        const fetchSetups = async (page) => {
            setLoading(true);
            try {
                const data = await setupApi.fetchSetups(page, pageSize);
                setSetups(data.data);
                setTotalSetups(data.navigation.total);
            } catch (error) {
                console.error('Error fetching setups:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSetups(currentPage);
    }, [currentPage, setLoading, newAddedSetup]);


    const updateRunningStrategies = () => {
        const tempObj = activeRunningStrategy;

        const handleCheck = (element) => {
            const timeoutInSeconds = calculateTimeout(element.time_interval);

            if (!activeRunningStrategy[element._id]) {
                tempObj[element._id] = {
                    _id: element._id,
                    time_interval: element.time_interval,
                    last_active: new Date(),
                    isRunning: undefined,
                    failedRunCount: 1
                }
            } else if (activeRunningStrategy[element._id]?.failedRunCount === 1) {
                tempObj[element._id].failedRunCount = 2;
            } else if (activeRunningStrategy[element._id]?.failedRunCount === 2) {
                tempObj[element._id].failedRunCount = 3;
                tempObj[element._id].isRunning = false;
            }

            setTimeout(() => { handleCheck(element) }, timeoutInSeconds * 1000);
        };

        setups.forEach(element => {
            handleCheck(element)
        });

        setActiveRunningStrategy(tempObj);
        setIsActiveRunningStrategyUpdated(true);
    }

    useEffect(() => {
        if (!isActiveRunningStrategyUpdated && setups.length > 0) {
            updateRunningStrategies()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setups]);

    const handleNextPage = () => {
        if (currentPage * pageSize < totalSetups) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getStatusIcon = (setup) => {
        if (!setup.is_active) {
            return 'static-dot-inactive'
        } else if (setup.is_active && activeRunningStrategy[setup._id]?.isRunning) {
            return "blinking-dot"
        } else if (setup.is_active && activeRunningStrategy[setup._id]?.isRunning === undefined) {
            return 'static-dot-pending'
        } else if (setup.is_active && !activeRunningStrategy[setup._id]?.isRunning) {
            return "blinking-dot-error"
        }
    }

    const runError = (setup) => {
        if (activeRunningStrategy?.errors[setup._id]) {
            console.log(activeRunningStrategy.errors[setup._id])
            return 'blinking-dot-danger'
        }
        return false;
    }

    return (
        <>
            <div className="row mt-5 card-custom">
                {setups.map(setup => (
                    <div className="col-12 col-md-6 col-lg-4 mb-4" key={setup._id}>
                        <Card className="strategy-card" onClick={() => handleCardClick(setup)}>
                            <CardHeader
                                title={setup.name}
                                action={<div className={runError(setup) || getStatusIcon(setup)}></div>}
                            />
                            <CardContent sx={{ position: 'relative' }}>
                                <div className='d-flex justify-content-between'>
                                    <div >
                                        <Typography><strong>Strategy:</strong> {setup.strategy_type}</Typography>
                                        <Typography><strong>Pair:</strong> {setup.target_asset}/{setup.quote_asset}</Typography>
                                        <Typography><strong>Timeframe:</strong> {setup.time_interval}</Typography>
                                    </div>
                                    {newSignals[setup._id] && <NotificationsIcon className='bell mt-4' />}
                                </div>


                                {runningStrategy.includes(setup._id) && (
                                    <div className={`progress ${runningStrategy.includes(setup._id) ? '' : 'progress-hidden'}`}>
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
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
                <Button variant="contained" onClick={handlePreviousPage} disabled={currentPage === 1} style={{ backgroundColor: '#3FB923' }}>
                    Previous
                </Button>
                <Button variant="contained" onClick={handleNextPage} disabled={currentPage * pageSize >= totalSetups} style={{ backgroundColor: '#3FB923' }}>
                    Next
                </Button>
            </div>
        </>
    );
};

export default StrategySetupCard;