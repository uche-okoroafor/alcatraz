import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import setupApi from '../api/setupApi';

// Sample data for dropdowns
const STRATEGIES = [
    { label: 'Peak Drop', value: 'peakDrop' },
    { label: 'Summit Full', value: 'SummitFull' },
];
const TARGET_ASSETS = ['BTC', 'ETH', 'XRP', 'ADA', 'DOGE', 'XAUUSD'];
const AGAINST_ASSETS = ['USDT', 'USD', 'EUR', 'GBP'];
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

const AddStrategySetupDialog = ({ onClose, open, initialSetup, onUpdate, setFocusedSetup, setInitialSetup }) => {
    const [newSetup, setNewSetup] = useState({
        name: '',
        strategy_type: '',
        target_asset: '',
        quote_asset: '',
        time_interval: '',
        dip_percentage: 0,
        is_deleted: false,
        is_active: true,
    });

    const [updatedFields, setUpdatedFields] = useState({});

    const defaultSetup = {
        name: '',
        strategy_type: '',
        target_asset: '',
        quote_asset: '',
        time_interval: '',
        dip_percentage: 0,
        is_deleted: false,
        is_active: true,
    };

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialSetup) {
            setNewSetup({
                name: initialSetup.name,
                strategy_type: initialSetup.strategy_type,
                target_asset: initialSetup.target_asset,
                quote_asset: initialSetup.quote_asset,
                time_interval: initialSetup.time_interval,
                dip_percentage: initialSetup.dip_percentage,
                is_deleted: initialSetup.is_deleted,
                is_active: initialSetup.is_active,
            });
        }
    }, [initialSetup]);

    const handleAddSetup = async () => {
        if (!newSetup.name || !newSetup.strategy_type || !newSetup.target_asset || !newSetup.quote_asset || !newSetup.time_interval) {
            alert('Please fill in all fields');
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

    const handleChange = (e, value) => {

        const { name, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value || e.target.value;

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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{initialSetup ? 'Edit Strategy Setup' : 'Add New Strategy Setup'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Setup Name"
                            name="name"
                            value={newSetup.name}
                            onChange={(e) => handleChange(e)}
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
                        >
                            {STRATEGIES.map(strategy => (
                                <MenuItem key={strategy.value} value={strategy.value}>{strategy.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Target Asset"
                            name="target_asset"
                            value={newSetup.target_asset}
                            onChange={(e) => handleChange(e)}
                        >
                            {TARGET_ASSETS.map(asset => (
                                <MenuItem key={asset} value={asset}>{asset}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Against Asset"
                            name="quote_asset"
                            value={newSetup.quote_asset}
                            onChange={(e) => handleChange(e)}
                        >
                            {AGAINST_ASSETS.map(asset => (
                                <MenuItem key={asset} value={asset}>{asset}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Timeframe"
                            name="time_interval"
                            value={newSetup.time_interval}
                            onChange={(e) => handleChange(e)}
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
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="is_deleted"
                                    checked={newSetup.is_deleted}
                                    onChange={(e) => handleChange(e)}
                                />
                            }
                            label="Is Deleted"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="is_active"
                                    checked={newSetup.is_active}
                                    onChange={(e) => handleChange(e)}
                                />
                            }
                            label="Is Active"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ margin: '10px 15px' }}>
                <Button onClick={onClose} style={{ backgroundColor: '#3FB923', color: 'white' }}>Cancel</Button>
                <Button onClick={handleAddSetup} variant="contained" disabled={loading} style={{ backgroundColor: '#3FB923' }}>
                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddStrategySetupDialog;