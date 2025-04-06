import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, TableSortLabel } from '@mui/material';
import { Delete } from '@mui/icons-material';
import scannerResultApi from '../api/scannerResultApi';
import moment from 'moment';
import { socket } from '../connection/socketIo';

const ScannerTable = ({ selectedSetup, setAllScanResults }) => {
  const [loading, setLoading] = useState(false);
  const [scannerResults, setScannerResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signalToDelete, setSignalToDelete] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('symbol');

  useEffect(() => {
    // Listen for scanners
    socket.on("scanner-result", (runningScannerObj) => {
      const scannerId = runningScannerObj._id;
      if (scannerId === selectedSetup._id) {
        setScannerResult(runningScannerObj.all_scan_result);
        setAllScanResults(runningScannerObj.all_scan_result);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchScanner = async () => {
      setLoading(true);
      try {
        const scannerResultId = selectedSetup.scan_result_id;
        const data = await scannerResultApi.fetchScannerResult(scannerResultId);
        const scanResult = data.data.all_scan_result;

        if (scanResult && scanResult.length) {
          setScannerResult(scanResult);
          setAllScanResults(scanResult);
        }
      } catch (error) {
        console.error('Error fetching scanner:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSetup) {
      fetchScanner();
    }
  }, [selectedSetup,setAllScanResults]);

  const handleNextPage = () => {
    if (currentPage * pageSize < scannerResults.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteClick = (signal) => {
    setSignalToDelete(signal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await scannerResultApi.delete(signalToDelete._id);
      setScannerResult(scannerResults.filter(signal => signal._id !== signalToDelete._id));
      setDeleteDialogOpen(false);
      setSignalToDelete(null);
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedResults = [...scannerResults].sort((a, b) => {
    if (orderBy === 'time') {
      return order === 'asc' ? new Date(a[orderBy]) - new Date(b[orderBy]) : new Date(b[orderBy]) - new Date(a[orderBy]);
    }
    return order === 'asc' ? a[orderBy] > b[orderBy] ? 1 : -1 : a[orderBy] < b[orderBy] ? 1 : -1;
  });

  const totalPages =  Math.ceil(scannerResults.length / pageSize);

  const displayedResults =  sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                  <TableCell sortDirection={orderBy === 'symbol' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'symbol'}
                      direction={orderBy === 'symbol' ? order : 'asc'}
                      onClick={() => handleRequestSort('symbol')}
                    >
                      Symbol
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'name' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'change' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'change'}
                      direction={orderBy === 'change' ? order : 'asc'}
                      onClick={() => handleRequestSort('change')}
                    >
                      Change
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'price' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'price'}
                      direction={orderBy === 'price' ? order : 'asc'}
                      onClick={() => handleRequestSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'changesPercentage' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'changesPercentage'}
                      direction={orderBy === 'changesPercentage' ? order : 'asc'}
                      onClick={() => handleRequestSort('changesPercentage')}
                    >
                      Change Percentage
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'time' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'time'}
                      direction={orderBy === 'time' ? order : 'asc'}
                      onClick={() => handleRequestSort('time')}
                    >
                      Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                {displayedResults.map((signal, index) => (
                  <TableRow key={signal.symbol}>
                    <TableCell>{signal.symbol}</TableCell>
                    <TableCell>{signal.name}</TableCell>
                    <TableCell>{signal.change}</TableCell>
                    <TableCell>{signal.price}</TableCell>
                    <TableCell>{signal.changesPercentage}</TableCell>
                    <TableCell>
                      {moment(signal.time).format('MMMM Do YYYY, h:mm:ss A')}
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
                <span> Page {currentPage} of {totalPages}</span>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Rows per page"
                  style={{ backgroundColor: '#3FB923' }}
                  className='m-3'
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </Typography>
              <Button variant="contained" className='m-3'
                style={{ backgroundColor: '#3FB923' }}
                onClick={handleNextPage} disabled={currentPage * pageSize >= scannerResults.length}>
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

export default ScannerTable;