import React, { useEffect, useState } from 'react';
import { IconButton, Popover, List, ListItem, ListItemText, Badge } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import signalApi from '../api/signalApi';

const Notification = ({ signalAlert, handleCardClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [signals, setSignals] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const { data } = await signalApi.getList();
                setSignals(data);
                setUnreadCount(data.filter(signal => !signal.is_read).length);
            } catch (error) {
                console.error('Error fetching signals:', error);
            }
        };

        fetchSignals();
    }, [signalAlert]);

    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationHeader = (signal) => {
        const what = signal.status === 'pending' ? "New" : "Closed";
        const where = signal.setup_name ? signal.setup_name : signal.setup_id;
        return `${what} Signal from ${where}`
    }

    const handleNotificationBody = (signal) => {
        return (<div>
            <strong>Position:</strong> {signal.signal} {' '}
            <strong>Price:</strong> {signal.signal_price} {' '}
            <strong>Take Profit:</strong> {signal.take_profit}  <br />
            <strong>Stop Loss:</strong> {signal.stop_loss} {' '}
            <strong>Status:</strong> {signal.status}
        </div>
        )
    }

    const openPopover = Boolean(anchorEl);
    const id = openPopover ? 'simple-popover' : undefined;

    return (
        <>
            <IconButton
                aria-describedby={id}
                onClick={handleNotificationClick}
                style={{ color: unreadCount > 0 ? 'red' : 'white' }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={openPopover}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <List>
                    {signals.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No new signals" />
                        </ListItem>
                    ) : (
                        signals.map((signal, index) => (
                            <ListItem key={index}
                                sx={{
                                    backgroundColor: signal.is_read ? 'white' : '#f0f0f0',
                                    marginBottom: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                <ListItemText
                                    primary={handleNotificationHeader(signal)}
                                    secondary={handleNotificationBody(signal)}
                                    onClick={() => {
                                        handleCardClick({ _id: signal.setup_id });
                                    }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </Popover >
        </>
    );
};

export default Notification;