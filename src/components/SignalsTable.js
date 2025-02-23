import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CheckCircle, Error, HourglassEmpty, Delete } from '@mui/icons-material';
import signalApi from '../api/signalApi';
import moment from 'moment';

const SignalsTable = ({ selectedSetup, setAllSignals }) => {
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSignals, setTotalSignals] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signalToDelete, setSignalToDelete] = useState(null);
  const pageSize = 9;

  useEffect(() => {
    const fetchSignals = async (page) => {
      setLoading(true);
      try {
        const data = await signalApi.fetchSignals(selectedSetup._id, page, pageSize);
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
    if (currentPage * pageSize < totalSignals) {
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

  const totalPages = Math.ceil(totalSignals / pageSize);

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
                  <TableCell>Signal Price</TableCell>
                  <TableCell>Take Profit</TableCell>
                  <TableCell>Stop Loss</TableCell>
                  <TableCell>Signal</TableCell>
                  <TableCell>Profit/Loss</TableCell>
                  <TableCell>Trade Amount</TableCell> {/* Added new field */}
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                {signals.map((signal) => (
                  <TableRow key={signal._id}>
                    <TableCell>{signal.signal_price}</TableCell>
                    <TableCell>
                      {typeof signal.take_profit === 'number' ? signal.take_profit.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof signal.stop_loss === 'number' ? signal.stop_loss.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>{signal.signal}</TableCell>
                    <TableCell>
                      {typeof signal?.profit_loss === 'number' ? signal.profit_loss.toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell>{signal.trade_amount}</TableCell> {/* Added new field */}
                    <TableCell>{getStatusIcon(signal.status)}</TableCell>
                    <TableCell>
                      {moment(signal?.created_at).format('MMMM Do YYYY, h:mm:ss A')}
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
                onClick={handleNextPage} disabled={currentPage * pageSize >= totalSignals}>
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
    </>
  );
};

export default SignalsTable;