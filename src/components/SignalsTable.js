import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Typography } from '@mui/material';
import { CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';
import signalApi from '../api/signalApi';
import moment from 'moment';

const SignalsTable = ({ selectedSetup }) => {
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSignals, setTotalSignals] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    const fetchSignals = async (page) => {
      setLoading(true);
      try {
        const data = await signalApi.fetchSignals(selectedSetup._id, page, pageSize);
        setSignals(data.data);
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

  const totalPages = Math.ceil(totalSignals / pageSize);

  return (
    <TableContainer component={Paper}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Signal Price</TableCell>
                <TableCell>Take Profit</TableCell>
                <TableCell>Stop Loss</TableCell>
                <TableCell>Signal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signals.map((signal) => (
                <TableRow key={signal._id}>
                  <TableCell>{signal.signal_price}</TableCell>
                  <TableCell>{signal.take_profit}</TableCell>
                  <TableCell>{signal.stop_loss}</TableCell>
                  <TableCell>{signal.signal}</TableCell>
                  <TableCell>{getStatusIcon(signal.status)}</TableCell>
                  <TableCell>{moment(signal?.created_at).format('DD/MM/YYYY hh:mm:ss:A')}</TableCell>
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
  );
};

export default SignalsTable;