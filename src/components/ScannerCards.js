import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import scannerApi from '../api/scannerApi';
import { calculateTimeout } from '../helpers';

const ScannerCards = (props) => {
    const { setLoading, handleCardClick, runningStrategy, newAddedSetup, activeRunningStrategy, setActiveRunningStrategy, newSignals } = props;
    const [scanners, setSetups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSetups, setTotalSetups] = useState(0);
    const [isActiveRunningScannerUpdated, setIsActiveRunningScannerUpdated] = useState(false);
    const pageSize = 9;
    const observer = useRef();
    const scannerIds = useRef(new Set());

    const fetchSetups = useCallback(async (page) => {
        setLoading(true);
        try {
            const data = await scannerApi.fetchSetups(page, pageSize);
            const newSetups = data.data.filter(scanner => !scannerIds.current.has(scanner._id));
            newSetups.forEach(scanner => scannerIds.current.add(scanner._id));
            setSetups(prevSetups => [...prevSetups, ...newSetups]);
            setTotalSetups(data.navigation.total);
        } catch (error) {
            console.error('Error fetching scanners:', error);
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

        scanners.forEach(element => {
            handleCheck(element)
        });

        setActiveRunningStrategy(tempObj);
        setIsActiveRunningScannerUpdated(true);
    }

    useEffect(() => {
        // if (!isActiveRunningScannerUpdated && scanners.length > 0) {
        //     updateRunningStrategies()
        // }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanners, isActiveRunningScannerUpdated]);

    const lastSetupElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && scanners.length < totalSetups) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [scanners.length, totalSetups]);

    const getStatusIcon = (scanner) => {
        if (!scanner.is_active) {
            return 'static-dot-inactive'
        } else if (scanner.is_active && activeRunningStrategy[scanner._id]?.isRunning) {
            return "styles_dot__p5bay styles_online__X4EkV"
        } else if (scanner.is_active && activeRunningStrategy[scanner._id]?.isRunning === undefined) {
            return 'static-dot-pending'
        } else if (scanner.is_active && !activeRunningStrategy[scanner._id]?.isRunning) {
            return "blinking-dot-error"
        }
    }

    const runError = (scanner) => {
        if (activeRunningStrategy?.errors[scanner._id]) {
            console.log(activeRunningStrategy.errors[scanner._id])
            return 'blinking-dot-danger'
        }
        return false;
    }

    return (
        <>
            <div className="row mt-4 card-custom" style={{ minHeight: '50vh' }}>
                {scanners.map((scanner, index) => (
                    <div
                        className="col-12 col-md-6 col-lg-4 mb-4"
                        key={scanner._id}
                        ref={index === scanners.length - 1 ? lastSetupElementRef : null}
                    >
                        <Card className="strategy-card" onClick={() => handleCardClick(scanner)}>
                            <CardHeader
                                className='card-header'
                                title={scanner.name}
                                action={
                                    <div className={runError(scanner) || getStatusIcon(scanner)}>
                                        <span><span></span></span>
                                    </div>
                                }
                            />
                            <CardContent sx={{ position: 'relative' }}>
                                <div className='d-flex justify-content-between'>
                                    <div >
                                        <Typography><strong>Scanner:</strong> {scanner.strategy_type}</Typography>
                                        <Typography><strong>Asset:</strong> {scanner.target_asset}</Typography>
                                        <Typography><strong>Time Interval:</strong> {scanner.time_interval}</Typography>
                                    </div>
                                    {newSignals.includes(scanner._id) && <NotificationsIcon className='bell mt-4' />}
                                </div>

                                {runningStrategy.includes(scanner._id) && (
                                    <div className={`progress ${runningStrategy.includes(scanner._id) ? '' : 'progress-hidden'}`}>
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

export default ScannerCards;