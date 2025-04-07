import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { STRATEGIES } from '../constants';


const FilterPopup = ({ open, onClose, onApply }) => {
    const [strategyType, setStrategyType] = useState('');
    const [symbol, setSymbol] = useState('');
    const [strategyName, setStrategyName] = useState('');

    const handleApply = () => {
        onApply({ strategyType, symbol, strategyName });
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { backgroundColor: '#232323', color: 'white' } }}>
            <DialogTitle sx={{ color: 'white' }}>Filter Strategies</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    select
                    label="Strategy Type"
                    value={strategyType}
                    onChange={(e) => setStrategyType(e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{
                        style: { color: 'white' },
                        classes: {
                            notchedOutline: 'white-border',
                        },
                    }}
                    placeholder="Select strategy type"
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
                    margin="normal"
                >
                    {STRATEGIES.map((strategy) => (
                        <MenuItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{
                        style: { color: 'white' },
                        classes: {
                            notchedOutline: 'white-border',
                        },
                    }}
                    placeholder="Enter symbol"
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
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Strategy Name"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{
                        style: { color: 'white' },
                        classes: {
                            notchedOutline: 'white-border',
                        },
                    }}
                    placeholder="Enter strategy name"
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
                    margin="normal"
                />
            </DialogContent>
            <DialogActions sx={{ margin: '10px 15px' }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'white', color: 'white' }}>
                    Cancel
                </Button>
                <Button onClick={handleApply} variant="contained" sx={{ backgroundColor: '#3FB923', color: 'white' }}>
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterPopup;
