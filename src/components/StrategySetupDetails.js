import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { Card, CardContent, Typography, Button, CardHeader } from '@mui/material';
import SignalsTable from './SignalsTable';
import StrategySetupForm from './StrategySetupForm';
import Chart from './Chart';
import setupApi from '../api/setupApi';
import marketPriceApi from '../api/marketPriceApi';

const SelectedSetupDetails = ({ selectedSetup, onUpdate, runningStrategy, activeRunningStrategy }) => {
    const [open, setOpen] = useState(false);
    const [chartOpen, setChartOpen] = useState(false);
    const [initialSetup, setInitialSetup] = useState(null);
    const [focusedSetup, setFocusedSetup] = useState(null);
    const [previousSelectedSetup, setPreviousSelectedSetup] = useState(null);
    const [signals, setSignals] = useState({});
    const [priceData, setPriceData] = useState([]);

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

    useEffect(() => {
        async function fetchPriceData() {
            const interval = selectedSetup?.time_interval.replace('m', 'min');
            // const symbol = selectedSetup?.target_asset;
            // const { data } = await marketPriceApi.fetchMarketPrice(symbol, interval);
            // setPriceData(data);
        }

        if (selectedSetup?.target_asset) {
            fetchPriceData();
        }
    }, [selectedSetup]);

    const handleEditClick = () => {
        setInitialSetup(focusedSetup);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleShowChartClick = () => {
        setChartOpen(true);
    };

    const getStatusIcon = (setup) => {
        if (!setup?.is_active) {
            return 'static-dot-inactive'
        } else if (setup?.is_active && activeRunningStrategy[setup._id]?.isRunning) {
            return "styles_dot__p5bay styles_online__X4EkV"
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
            <Card className="strategy-details" sx={{ position: 'relative' }}>
                <CardHeader
                    title={focusedSetup?.name}
                    className='card-header'
                    action={
                        <div className={runError() || getStatusIcon(focusedSetup)}>
                            <span><span></span></span>
                        </div>
                    }
                    sx={{ paddingBottom: '0px' }}
                />
                <CardContent className='card-content'>
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
                    <Typography variant="body2" color="text.secondary">
                        <strong>Amount:</strong>
                        {' '} ${typeof focusedSetup?.capital === 'number' ? focusedSetup?.capital.toFixed(2) : 'N/A'}
                    </Typography>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button className='mt-2' variant="contained" onClick={handleShowChartClick}
                            style={{
                                backgroundColor: '#2fa8f6',
                                marginRight: '10px'
                            }}>
                            Show Chart
                        </Button>

                        <Button className='mt-2 ml-5' variant="contained" onClick={handleEditClick} style={{ backgroundColor: '#3FB923' }}>
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
                <SignalsTable
                    selectedSetup={selectedSetup}
                    setAllSignals={setSignals}
                />
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

            {chartOpen && focusedSetup?.price_data?.length > 0 && <Chart
                focusedSetup={focusedSetup}
                priceData={priceData}
                signals={signals}
                open={chartOpen}
                setChartOpen={setChartOpen}
            />}


        </div>
    );
};

export default SelectedSetupDetails;