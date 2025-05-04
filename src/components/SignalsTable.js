import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CheckCircle, Error, HourglassEmpty, Delete, Cancel } from '@mui/icons-material';
import signalApi from '../api/signalApi';
import moment from 'moment';

const SignalsTable = ({ selectedSetup, setAllSignals }) => {
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSignals, setTotalSignals] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signalToDelete, setSignalToDelete] = useState(null);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [signalToTerminate, setSignalToTerminate] = useState(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchSignals = async (page) => {
      setLoading(true);
      try {
        const data = await signalApi.fetchSignals(selectedSetup._id, page, limit);
        setSignals(data.data);
        setAllSignals(data.data);
        setTotalSignals(data.navigation.total);
      } catch (error) {
        console.error('Error fetching signals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSetup) {
      fetchSignals(currentPage);
    }
  }, [selectedSetup, currentPage]);

  useEffect(() => {
    const updateReadSignals = async () => {
      try {
        await Promise.all(
          signals.map(signal => !signal.is_read && signalApi.update(signal._id, { is_read: true }))
        );
      } catch (error) {
        console.error('Error updating signals:', error);
      }
    };

    if (signals && signals.length > 0) {
      updateReadSignals();
    }
  }, [signals, currentPage]);

  const handleNextPage = () => {
    if (currentPage * limit < totalSignals) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle style={{ color: 'green' }} />;
      case 'failed':
        return <Error style={{ color: 'red' }} />;
      case 'pending':
        return <HourglassEmpty className="rotating-icon" style={{ color: 'orange' }} />;
      default:
        return null;
    }
  };

  const handleDeleteClick = (signal) => {
    setSignalToDelete(signal);
    setDeleteDialogOpen(true);
  };

  const handleTerminateClick = (signal) => {
    setSignalToTerminate(signal);
    setTerminateDialogOpen(true);
  };

  const handleTerminateConfirm = async () => {
    try {
      await signalApi.terminatePosition(signalToTerminate._id);
      setTerminateDialogOpen(false);
      setSignalToTerminate(null);
    } catch (error) {
      console.error('Error terminating signal:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await signalApi.delete(signalToDelete._id);
      setSignals(signals.filter(signal => signal._id !== signalToDelete._id));
      setDeleteDialogOpen(false);
      setSignalToDelete(null);
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
  };

  const totalPages = Math.ceil(totalSignals / limit);

  return (
    <>
      <TableContainer
        className='table-container'
        component={Paper}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Table >
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Entry Price</TableCell>
                  <TableCell>Take Profit</TableCell>
                  <TableCell>Stop Loss</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Max Profit Exit</TableCell>
                  <TableCell>Profit/Loss</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Opened At</TableCell>
                  <TableCell>Closed At</TableCell>
                  <TableCell>Close </TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                {signals.map((signal) => (
                  <TableRow key={signal._id}>
                    <TableCell>{signal.symbol}</TableCell>
                    <TableCell>{signal.signal_price}</TableCell>
                    <TableCell>
                      {typeof signal.take_profit === 'number' ? signal.take_profit.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof signal.stop_loss === 'number' ? signal.stop_loss.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>{signal.signal}</TableCell>
                    <TableCell>
                      {typeof signal?.max_profit_before_exit === 'number' ? signal.max_profit_before_exit.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof signal?.profit_loss === 'number' ? (
                        <span style={{ color: signal.profit_loss >= 0 ? 'green' : 'red' }}>
                          {signal.profit_loss.toFixed(2)}
                        </span>
                      ) : 'N/A'}
                    </TableCell>
                    {/* <TableCell>{signal.trade_amount}</TableCell> */}
                    <TableCell>{getStatusIcon(signal.status)}</TableCell>
                    <TableCell>
                      {moment(signal?.created_at).format('MMMM Do YYYY, h:mm:ss A')}
                    </TableCell>
                    <TableCell>
                      {signal?.closed_at ? moment(signal?.closed_at).format('MMMM Do YYYY, h:mm:ss A') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {signal?.terminated ? 'Terminated' :
                        signal.status !== 'pending' ? 'Closed' :
                          <Button onClick={() => handleTerminateClick(signal)}><Cancel style={{ color: 'red' }} /></Button>}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleDeleteClick(signal)}><Delete style={{ color: 'red' }} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button variant="contained" style={{ backgroundColor: '#3FB923' }} onClick={handlePreviousPage} disabled={currentPage === 1} className='m-3'>
                Previous
              </Button>
              <Typography variant="body1">
                Page {currentPage} of {totalPages}
              </Typography>
              <Button variant="contained" className='m-3'
                style={{ backgroundColor: '#3FB923' }}
                onClick={handleNextPage} disabled={currentPage * limit >= totalSignals}>
                Next
              </Button>
            </div>
          </>
        )}
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this signal?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={terminateDialogOpen} onClose={() => setTerminateDialogOpen(false)}>
        <DialogTitle>Confirm Terminate</DialogTitle>
        <DialogContent>
          Are you sure you want to terminate this signal?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminateDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleTerminateConfirm} variant="contained" color="secondary">Terminate</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignalsTable;