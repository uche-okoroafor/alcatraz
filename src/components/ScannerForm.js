import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress, Switch, FormControlLabel, Snackbar, Alert
} from '@mui/material';
import scannerApi from '../api/scannerApi';
import userApi from '../api/userApi'; // Import userApi for validation

// Sample data for dropdowns
const SCANNER_TYPE = [
    { label: 'Market Top Gainers', value: 'MarketTopGainers' },
    { label: 'Market Top Losers', value: 'MarketTopLosers' },
    { label: 'Market Highest Volume', value: 'MarketHighestVolume' },
];
const TIMEFRAMES = ['0.5m','1m', '2m', '3m', '4m', '5m', '15m', '30m', '1h', '4h', '1d'];

const AddScannerDialog = ({ onClose, open, initialSetup, onUpdate, setFocusedSetup, setInitialSetup }) => {
    const [newScanner, setNewScanner] = useState({
        name: '',
        scanner_type: '',
        min_price: '',
        max_price: '',
        time_interval: '',
        change_percentage: 0,
        volume: 0,
        is_deleted: false,
        is_active: true,
        run_demo_trade: false, 
        run_live_trade: false,
    });

    const [updatedFields, setUpdatedFields] = useState({});

    const defaultSetup = {
        name: '',
        scanner_type: '',
        min_price: '',
        max_price: '',
        time_interval: '',
        change_percentage: 0,
        volume: 0,
        is_deleted: false,
        is_active: true,
        run_demo_trade: false, 
        run_live_trade: false,
    };

    const [loading, setLoading] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (initialSetup) {
            setNewScanner({
                name: initialSetup.name,
                scanner_type: initialSetup.scanner_type,
                min_price: initialSetup.min_price,
                max_price: initialSetup.max_price,
                time_interval: initialSetup.time_interval,
                change_percentage: initialSetup.change_percentage,
                volume: initialSetup.volume,
                is_deleted: initialSetup.is_deleted,
                is_active: initialSetup.is_active,
                run_demo_trade: initialSetup.run_demo_trade,
                run_live_trade: initialSetup.run_live_trade,
            });
        }
    }, [initialSetup]);

    const handleAddSetup = async () => {
        if (!newScanner.name || !newScanner.scanner_type || !newScanner.time_interval) {
            alert(`Field ${!newScanner.name ? 'Name' : !newScanner.scanner_type ? 'Strategy' : 'Time Interval'} is required`);
            return;
        }

        setLoading(true);
        try {
            if (initialSetup) {
                const updatedSetup = await scannerApi.update(initialSetup._id, updatedFields);

                if (updatedSetup) {
                    setFocusedSetup({ ...initialSetup, ...newScanner });
                    setInitialSetup(null);
                    onUpdate({ ...initialSetup, ...newScanner });
                }
            } else {
                const addedSetup = await scannerApi.add(newScanner);
                const scannerToAdd = {
                    ...addedSetup,
                    id: Date.now(),
                };

                onUpdate(scannerToAdd);
            }
            setNewScanner(defaultSetup);
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
                setNewScanner({ ...newScanner, run_live_trade: true });
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
        setNewScanner({ ...newScanner, [name]: newValue });

        if (initialSetup) {
            setUpdatedFields({ ...updatedFields, [name]: newValue });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} PaperProps={{ sx: { backgroundColor: '#232323', color: 'white' } }}>
                <DialogTitle sx={{ color: 'white' }}>{initialSetup ? 'Edit Scanner Setup' : 'Add New Scanner'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Setup Name"
                                name="name"
                                value={newScanner.name}
                                onChange={(e) => handleChange(e)}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter scanner name"
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
                                name="scanner_type"
                                value={newScanner.scanner_type}
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
                                {SCANNER_TYPE.map(strategy => (
                                    <MenuItem key={strategy.value} value={strategy.value}>{strategy.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Min Price"
                                type="number"
                                name="min_price"
                                value={newScanner.min_price}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter minimum price"
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
                                label="Max Price"
                                type="number"
                                name="max_price"
                                value={newScanner.max_price}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter maximum price"
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
                                value={newScanner.time_interval}
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
                                label="Change Percentage"
                                type="number"
                                name="change_percentage"
                                value={newScanner.change_percentage}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter change percentage"
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
                                label="Volume"
                                type="number"
                                name="volume"
                                value={newScanner.volume}
                                onChange={(e) => handleChange(e, parseFloat(e.target.value))}
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{
                                    style: { color: 'white' },
                                    classes: {
                                        notchedOutline: 'white-border',
                                    },
                                }}
                                placeholder="Enter volume"
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
                                        checked={newScanner.is_deleted}
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
                                        checked={newScanner.is_active}
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
                                        checked={newScanner.run_demo_trade}
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
                                        checked={newScanner.run_live_trade}
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

export default AddScannerDialog;