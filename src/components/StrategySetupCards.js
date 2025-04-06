import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import setupApi from '../api/setupApi';
import { calculateTimeout } from '../helpers';
import { socket } from '../connection/socketIo';
import moment from 'moment';

const StrategySetupCards = (props) => {
    const { setLoading, handleCardClick, runningStrategy, newAddedSetup, activeRunningStrategy, setActiveRunningStrategy, newSignals } = props;
    const [setups, setSetups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSetups, setTotalSetups] = useState(0);
    const [isActiveRunningStrategyUpdated, setIsActiveRunningStrategyUpdated] = useState(false);
    const pageSize = 9;
    const observer = useRef();
    const setupIds = useRef(new Set());

    const fetchSetups = useCallback(async (page) => {
        setLoading(true);
        try {
            const data = await setupApi.fetchSetups(page, pageSize);
            const newSetups = data.data.filter(setup => !setupIds.current.has(setup._id));
            newSetups.forEach(setup => setupIds.current.add(setup._id));
            setSetups(prevSetups => [...prevSetups, ...newSetups]
                // .sort((a, b) => new Date(b.is_active) - new Date(a.is_active))
            );
            setTotalSetups(data.navigation.total);
        } catch (error) {
            console.error('Error fetching setups:', error);
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    useEffect(() => {
        fetchSetups(currentPage);
    }, [currentPage, newAddedSetup, fetchSetups]);

    const updateRunningStrategies = () => {
        const tempObj = activeRunningStrategy;

        const handleCheck = (element) => {
            const timeoutInSeconds = calculateTimeout(element.time_interval);
            const isWithInTime = new Date(element.last_active).getTime() + timeoutInSeconds * 1000 > new Date().getTime();

            if (!activeRunningStrategy[element._id]) {
                tempObj[element._id] = {
                    _id: element._id,
                    time_interval: element.time_interval,
                    last_active: new Date(),
                    isRunning: isWithInTime || undefined,
                    failedRunCount: 1
                }
            } else if (activeRunningStrategy[element._id]?.failedRunCount === 1) {
                tempObj[element._id].failedRunCount = 2;
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
    }, [setups, isActiveRunningStrategyUpdated]);

    const lastSetupElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && setups.length < totalSetups) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [setups.length, totalSetups]);

    const getStatusIcon = (setup) => {
        if (!setup.is_active) {
            return 'static-dot-inactive'
        } else if (setup.is_active && activeRunningStrategy[setup._id]?.isRunning) {
            return "styles_dot__p5bay styles_online__X4EkV"
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
            <div className="row mt-4 card-custom" style={{ minHeight: '50vh' }}>
                {setups.map((setup, index) => (
                    <div
                        className="col-12 col-md-6 col-lg-4 mb-4"
                        key={setup._id}
                        ref={index === setups.length - 1 ? lastSetupElementRef : null}
                    >
                        <Card className="strategy-card" onClick={() => handleCardClick(setup)}>
                            <CardHeader
                                className='card-header'
                                title={setup.name}
                                action={
                                    <div className={runError(setup) || getStatusIcon(setup)}>
                                        <span><span></span></span>
                                    </div>
                                }
                            />
                            <CardContent sx={{ position: 'relative' }}>
                                <div className='d-flex justify-content-between'>
                                    <div >
                                        <Typography><strong>Strategy:</strong> {setup.strategy_type}</Typography>
                                        <Typography><strong>Symbol:</strong> {setup.symbol}</Typography>
                                        <Typography><strong>Time Interval:</strong> {setup.time_interval}</Typography>
                                        {/* <Typography><strong>Last Active:</strong> {' '} 
                                        {moment(setup?.last_active).format('MMMM Do YYYY, h:mm:ss A')}</Typography> */}
                                    </div>
                                    {newSignals.includes(setup._id) && <NotificationsIcon className='bell mt-4' />}
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
        </>
    );
};

export default StrategySetupCards;