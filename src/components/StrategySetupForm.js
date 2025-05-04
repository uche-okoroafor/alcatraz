import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress, Switch, FormControlLabel, Snackbar, Alert
} from '@mui/material';
import setupApi from '../api/setupApi';
import userApi from '../api/userApi'; // Import userApi for validation

// Sample data for dropdowns
const STRATEGIES = [
    { label: 'Peak Drop', value: 'PeakDrop' },
    { label: 'Summit Full', value: 'SummitFull' },
    { label: 'Tori Trend Line', value: 'ToriTrendLine' },
    { label: 'Consolidation Breakout', value: 'ConsolidationBreakout' },
    { label: 'Double 7', value: 'Double7' },
    { label: 'TrendLineSRSD', value: 'TrendLineSRSD' },
    { label: 'Stock Scanner Short', value: 'StockScannerShort' },
    {label: 'Equal Risk Position Sizing', value: 'EqualRiskPositionSizing' },
    {label: 'Rob Book VWap', value: 'RobBookVWap' },
    {label: 'VWap RobBook Short ', value: 'VWapRobBookShort'}
];
const TIMEFRAMES = ['0.1m','0.2m','0.3m','0.4m','0.5m','1m', '2m', '3m', '4m', '5m', '15m', '30m', '1h', '4h', '1d'];


const AddStrategySetupDialog = ({ onClose, open, initialSetup, onUpdate, setFocusedSetup, setInitialSetup }) => {
    const [newSetup, setNewSetup] = useState({
        name: '',
        strategy_type: '',
        symbol: '', // Renamed from symbol
        time_interval: '',
        dip_percentage: 0,
        is_deleted: false,
        is_active: true,
        time_frame: '', // Added new field
        run_demo_trade: false, // Added new field
        run_live_trade: false, // Added new field
        trade_amount: 0, // Added new field
    });

    const [updatedFields, setUpdatedFields] = useState({});

    const defaultSetup = {
        name: '',
        strategy_type: '',
        symbol: '', // Renamed from symbol
        time_interval: '',
        dip_percentage: 0,
        is_deleted: false,
        is_active: true,
        time_frame: '', // Added new field
        run_demo_trade: false, // Added new field
        run_live_trade: false, // Added new field
        trade_amount: 0, // Added new field
    };

    const isScannerSelected = newSetup.strategy_type.includes('Scanner');

    const [loading, setLoading] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (initialSetup) {
            setNewSetup({
                name: initialSetup.name,
                strategy_type: initialSetup.strategy_type,
                symbol: initialSetup.symbol || '', // Renamed from symbol
                time_interval: initialSetup.time_interval,
                dip_percentage: initialSetup.dip_percentage,
                is_deleted: initialSetup.is_deleted,
                is_active: initialSetup.is_active,
                time_frame: initialSetup.time_frame || '', // Added new field
                run_demo_trade: initialSetup.run_demo_trade || false, // Added new field
                run_live_trade: initialSetup.run_live_trade || false, // Added new field
                trade_amount: initialSetup.trade_amount || 0, // Added new field
            });
        }
    }, [initialSetup]);

    const handleAddSetup = async () => {
        if ((!newSetup.name || !newSetup.strategy_type || !newSetup.symbol || !newSetup.time_interval) && !isScannerSelected) {
            alert(`Field ${!newSetup.name ? 'Name' : !newSetup.strategy_type ? 'Strategy' : !newSetup.symbol ? 'Symbol' : 'Time Interval'} is required`);
            return;
        }

        setLoading(true);
        try {
            if (initialSetup) {
                const updatedSetup = await setupApi.update(initialSetup._id, updatedFields);

                if (updatedSetup) {
                    setFocusedSetup({ ...initialSetup, ...newSetup });
                    setInitialSetup(null);
                    onUpdate({ ...initialSetup, ...newSetup });
                }
            } else {
                const addedSetup = await setupApi.add(newSetup);
                const setupToAdd = {
                    ...addedSetup,
                    id: Date.now(),
                };

                onUpdate(setupToAdd);
            }
            setNewSetup(defaultSetup);
            onClose();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            const response = await userApi.validateTradeLive({ password });
            if (response.valid) {
                setNewSetup({ ...newSetup, run_live_trade: true });
                setUpdatedFields({ ...updatedFields, run_live_trade: true });
                setPasswordDialogOpen(false);
                setPassword('');
                setPasswordError('');
            } else {
                setPasswordError('Invalid password');
            }
        } catch (error) {
            setPasswordError('Validation failed');
        }
    };

    const handleChange = (e, value) => {
        const { name, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value || e.target.value;

        if (name === 'run_live_trade' && checked) {
            setPasswordDialogOpen(true);
            return;
        }

        // Prevent negative values for time_interval
        if (name === 'time_interval' && Number(newValue) < 0) {
            newValue = 0;
        }
        setNewSetup({ ...newSetup, [name]: newValue });

        if (initialSetup) {
            setUpdatedFields({ ...updatedFields, [name]: newValue });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} PaperProps={{ sx: { backgroundColor: '#232323', color: 'white' } }}>
                <DialogTitle sx={{ color: 'white' }}>{initialSetup ? 'Edit Strategy Setup' : 'Add New Setup'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Setup Name"
                                name="name"
                                value={newSetup.name}
                                onChange={(e) => handleChange(e)}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter setup name"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Strategy"
                                name="strategy_type"
                                value={newSetup.strategy_type}
                                onChange={(e) => handleChange(e)}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Select strategy"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            >
                                {STRATEGIES.map(strategy => (
                                    <MenuItem key={strategy.value} value={strategy.value}>{strategy.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Symbol" // Renamed from Target Asset
                                name="symbol" // Updated name
                                value={newSetup.symbol} // Updated value
                                onChange={(e) => handleChange(e)} // Updated handler
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter symbol" // Updated placeholder
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Time Frame" // Added new field
                                type="text"
                                name="time_frame"
                                value={newSetup.time_frame}
                                onChange={(e) => handleChange(e)}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter time frame"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Interval"
                                name="time_interval"
                                value={newSetup.time_interval}
                                onChange={(e) => handleChange(e)}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Select timeframe"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            >
                                {TIMEFRAMES.map(timeframe => (
                                    <MenuItem key={timeframe} value={timeframe}>{timeframe}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Dip Percentage"
                                type="number"
                                name="dip_percentage"
                                value={newSetup.dip_percentage}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter dip percentage"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Trade Amount" // Added new field
                                type="number"
                                name="trade_amount"
                                value={newSetup.trade_amount}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter trade amount"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'white',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="is_deleted"
                                        checked={newSetup.is_deleted}
                                        onChange={(e) => handleChange(e)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: 'white',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                }
                                label="Is Deleted"
                                sx={{ color: 'white' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="is_active"
                                        checked={newSetup.is_active}
                                        onChange={(e) => handleChange(e)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: 'white',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                }
                                label="Is Active"
                                sx={{ color: 'white' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="run_demo_trade"
                                        checked={newSetup.run_demo_trade}
                                        onChange={(e) => handleChange(e)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: 'white',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                }
                                label="Run Demo Trade"
                                sx={{ color: 'white' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="run_live_trade"
                                        checked={newSetup.run_live_trade}
                                        onChange={(e) => handleChange(e)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: 'white',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: 'white',
                                            },
                                        }}
                                    />
                                }
                                label="Run Live Trade"
                                sx={{ color: 'white' }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px 15px' }}>
                    <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'white', color: 'white' }}>Cancel</Button>
                    <Button onClick={handleAddSetup} variant="contained" disabled={loading} sx={{ backgroundColor: '#3FB923', color: 'white' }}>
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} PaperProps={{ sx: { backgroundColor: '#232323', color: 'white' } }}>
                <DialogTitle sx={{ color: 'white' }}>Enter Password</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{
                            style: { color: 'white' },
                            classes: {
                                notchedOutline: 'white-border',
                            },
                        }}
                        placeholder="Enter your password"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                },
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: 'white',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)} variant="outlined" sx={{ borderColor: 'white', color: 'white' }}>Cancel</Button>
                    <Button onClick={handlePasswordSubmit} variant="contained" sx={{ backgroundColor: '#3FB923', color: 'white' }}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
                    {passwordError}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AddStrategySetupDialog;