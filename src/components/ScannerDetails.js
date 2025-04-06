import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { Card, CardContent, Typography, Button, CardHeader, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import ScannerResultTable from './ScannerResultTable';
import ScannerForm from './ScannerForm';
import scannerApi from '../api/scannerApi';

const SelectedSetupDetails = ({ selectedSetup, onUpdate, runningScanner, activeRunningScanner }) => {
    const [open, setOpen] = useState(false);
    const [chartOpen, setChartOpen] = useState(false);
    const [initialSetup, setInitialSetup] = useState(null);
    const [focusedSetup, setFocusedSetup] = useState(null);
    const [previousSelectedSetup, setPreviousSelectedSetup] = useState(null);
    const [scanResults, setAllScanResults] = useState([]);
    const [priceData, setPriceData] = useState([]);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [symbols, setSymbols] = useState('');

    useEffect(() => {
        async function fetchData() {
            const setupId = selectedSetup?._id;
            if (setupId) {
                const { data } = await scannerApi.getDetails(setupId);
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
            // const symbol = selectedSetup?.symbol;
            // const { data } = await marketPriceApi.fetchMarketPrice(symbol, interval);
            // setPriceData(data);
        }

        if (selectedSetup?.symbol) {
            fetchPriceData();
        }
    }, [selectedSetup]);

    const handleEditClick = () => {
        console.log(focusedSetup, '******** focusedSetup handleEditClick ********')
        setInitialSetup(focusedSetup);
        setOpen(true);
    };

    const handleCopyClick = () => {
        const symbolsList = scanResults.map(signal => signal.symbol).join(',');
        setSymbols(symbolsList);
        setCopyDialogOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCopyDialogOpen(false);
    };

    const handleShowChartClick = () => {
        setChartOpen(true);
    };

    const getStatusIcon = (setup) => {
        if (!setup?.is_active) {
            return 'static-dot-inactive'
        } else if (setup?.is_active && activeRunningScanner[setup._id]?.isRunning) {
            return "styles_dot__p5bay styles_online__X4EkV"
        } else if (setup?.is_active && activeRunningScanner[setup._id]?.isRunning === undefined) {
            return 'static-dot-pending'
        } else if (setup?.is_active && !activeRunningScanner[setup._id]?.isRunning) {
            return "blinking-dot-error"
        }
    }

    const runError = () => {
        if (activeRunningScanner?.errors[focusedSetup?._id]) {
            console.log(activeRunningScanner?.errors[focusedSetup?._id])
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
                        <strong>Scanner Type:</strong> {focusedSetup?.scanner_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Change Percentage:</strong> {focusedSetup?.change_percentage} %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Min Price</strong> {focusedSetup?.min_price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Max Price</strong> {focusedSetup?.max_price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Timeframe:</strong> {focusedSetup?.time_interval}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Run Count:</strong> {focusedSetup?.run_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Total Symbols :</strong> {scanResults.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Last Run Time:</strong>
                        {' '} {moment(focusedSetup?.last_active).format('MMMM Do YYYY, h:mm:ss A')}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button className='mt-2' variant="contained" onClick={handleCopyClick}
                            style={{
                                backgroundColor: '#3FB923',
                                marginRight: '10px'
                            }}>
                            Copy
                        </Button>

                        <Button className='mt-2 ml-5' variant="contained" onClick={handleEditClick} style={{ backgroundColor: '#3FB923' }}>
                            Edit
                        </Button>
                    </div>
                    {runningScanner.includes(focusedSetup?._id) && (
                        <div className={`progress mt-2 ${runningScanner.includes(focusedSetup?._id) ? '' : 'progress-hidden'}`}>
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
                <ScannerResultTable
                    selectedSetup={selectedSetup}
                    setAllScanResults={setAllScanResults}
                />
            </div>
            <ScannerForm
                open={open}
                onClose={handleClose}
                setOpen={setOpen}
                initialSetup={initialSetup}
                setInitialSetup={setInitialSetup}
                setFocusedSetup={setFocusedSetup}
                onUpdate={onUpdate}
            />

            <Dialog open={copyDialogOpen} onClose={handleClose}>
                <DialogTitle>Copy Symbols</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Symbols"
                        value={symbols}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SelectedSetupDetails;