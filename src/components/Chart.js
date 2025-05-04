import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Select, MenuItem } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import ReplayIcon from '@mui/icons-material/Replay';
import { calculateMA, convertToRawData } from '../helpers';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { formatISO, subDays } from 'date-fns'; // Import date-fns for date manipulation
import marketPriceApi from '../api/marketPriceApi'; // Import your market price API
import { mockMarketPriceData } from './mockData/mockData';

const Chart = ({ setChartOpen, focusedSetup, signals }) => {
  const initialData = focusedSetup;
  const chartContainerRef = useRef(null);
  const [data, setData] = useState([]);
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeFrame, setTimeFrame] = useState('1min');
  const [fromDate, setFromDate] = useState(formatISO(subDays(new Date(), 5), { representation: 'date' })); // Default to 5 days ago
  const [toDate, setToDate] = useState(formatISO(new Date(), { representation: 'date' })); // Default to today
  const [tooltip, setTooltip] = useState(null);
  const [indicator, setIndicator] = useState('None'); // Default to no indicator
  const [fetchDbData, setFetchDbData] = useState(true);
  const [limit, setLimit] = useState(10000);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  const signal = signals[0];

  const entryPrice = signal?.signal_price || 0;
  const isBuy = signal?.signal?.toLowerCase() === 'buy';
  const aboveEntryPrice = signal?.take_profit || 0;
  const belowEntryPrice = signal?.stop_loss || 0;

  useEffect(() => {
    if (initialData) {
      const symbol = signal.symbol || initialData.symbol || initialData.symbol || 'XAUUSD';
      const timeFrame = '1min';
      const defaultFromDate = formatISO(subDays(new Date(), 5), { representation: 'date' });
      const defaultToDate = formatISO(new Date(), { representation: 'date' });

      setSymbol(symbol);
      setTimeFrame(timeFrame);
      setFromDate(defaultFromDate);
      setToDate(defaultToDate);

      fetchData(symbol, timeFrame, defaultFromDate, defaultToDate);
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async (ptSymbol, psTimeFrame, psDefaultFromDate, psDefaultToDate, currentPage = page) => {
    if (isLoading) return;
    
    setIsLoading(true);
    ptSymbol = ptSymbol || symbol;
    psTimeFrame = psTimeFrame || timeFrame;
    psDefaultFromDate = psDefaultFromDate || fromDate;
    psDefaultToDate = psDefaultToDate || toDate;
    
    try {
      const response = await marketPriceApi.fetchMarketPrice(ptSymbol, psTimeFrame, psDefaultFromDate, psDefaultToDate, fetchDbData, currentPage, limit);
      const result = await response.data;


      // Convert the API data to the required format
      const formattedData = result
        .map((item) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000), 
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: Number(item.volume) || 0, // Convert to number, default to 0 if invalid
        }))
        .sort((a, b) => a.time - b.time); // Sort by time

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClick = () => {
    if (data.length === 0) setFetchDbData(false);
    fetchData();
  };

  useEffect(() => {
    if (data.length === 0) return;

    // Create the chart instance with dark theme
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.offsetWidth,
      height: chartContainerRef.current.offsetHeight,
      layout: {
        background: { type: 'solid', color: '#1e1e1e' }, // Dark background
        textColor: '#d1d4dc', // Light text color
      },
      grid: {
        vertLines: { color: '#2b2b2b' }, // Darker grid lines
        horzLines: { color: '#2b2b2b' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#758696',
          style: 0,
          labelBackgroundColor: '#1e1e1e',
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 0,
          labelBackgroundColor: '#1e1e1e',
        }
      },
      timeScale: {
        timeVisible: true, // Enable time visibility on the x-axis
        secondsVisible: true, // Show seconds for finer granularity
      },
    });

    // Add a candlestick series to the chart
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'green',
      downColor: 'red',
      borderVisible: false,
      wickUpColor: 'green',
      wickDownColor: 'red',
    });

    // Set the fetched data for the candlestick series
    candlestickSeries.setData(data);

    // // Add a vertical line for the entry signal
    // if (entryPrice) {
    //   const cloneData = structuredClone(data);
    //   const entryCandle = cloneData.find((candle) => candle.close === entryPrice);
    //   if (entryCandle) {
    //     const verticalLineSeries = chart.addSeries(LineSeries, {
    //       color: 'blue',
    //       lineWidth: 1,
    //     });
    //     verticalLineSeries.setData([
    //       { time: entryCandle.time, value: Math.min(...cloneData.map((c) => c.low)) },
    //       { time: entryCandle.time, value: Math.max(...cloneData.map((c) => c.high)) },
    //     ]);
    //   }
    // }

    // Center the chart on the current price
    const visibleRange = chart.timeScale().getVisibleRange();
    if (visibleRange) {
      const centerOffset = Math.floor((visibleRange.to - visibleRange.from) / 800);
      chart.timeScale().scrollToPosition(centerOffset, false);
    }


    // Add horizontal lines for signal_price, take_profit, and stop_loss
    if (entryPrice) {
      const entryLine = chart.addSeries(LineSeries, {
        color: 'blue',
        lineWidth: 2,
      });
      entryLine.setData([{ time: data[0].time, value: entryPrice }, { time: data[data.length - 1].time, value: entryPrice }]);
      entryLine.createPriceLine({
        price: entryPrice,
        color: 'blue',
        lineWidth: 1,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'Entry',
      });
    }

    if (aboveEntryPrice) {
      const tpLine = chart.addSeries(LineSeries, {
        color: 'green',
        lineWidth: 2,
      });
      tpLine.setData([{ time: data[0].time, value: aboveEntryPrice }, { time: data[data.length - 1].time, value: aboveEntryPrice }]);
      tpLine.createPriceLine({
        price: aboveEntryPrice,
        color: 'green',
        lineWidth: 1,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'TP',
      });
    }

    if (belowEntryPrice) {
      const slLine = chart.addSeries(LineSeries, {
        color: 'red',
        lineWidth: 2,
      });
      slLine.setData([{ time: data[0].time, value: belowEntryPrice }, { time: data[data.length - 1].time, value: belowEntryPrice }]);
      slLine.createPriceLine({
        price: belowEntryPrice,
        color: 'red',
        lineWidth: 1,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'SL',
      });
    }

    let indicatorSeries = null;

    if (indicator === 'SMA') {
      // Add a moving average (SMA) indicator
      const calculateSMA = (data, period) => {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
          if (i >= period - 1) {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
            const value = sum / period;
            if (!isNaN(value)) {
              sma.push({ time: data[i].time, value });
            }
          }
        }
        return sma;
      };

      const smaData = calculateSMA(data, 10); // Calculate 10-period SMA
      indicatorSeries = chart.addSeries(LineSeries, {
        color: 'blue',
        lineWidth: 2,
      });
      indicatorSeries.setData(smaData);
    } else if (indicator === 'VWAP') {
      // Add a VWAP indicator
      const calculateVWAP = (data) => {
        let cumulativeVolume = 0;
        let cumulativePriceVolume = 0;
        return data.map((item) => {
          cumulativeVolume += item.volume;
          cumulativePriceVolume += (item.high + item.low + item.close) / 3 * item.volume;
          const value = cumulativePriceVolume / cumulativeVolume;
          return !isNaN(value) ? { time: item.time, value } : null;
        }).filter((point) => point !== null); // Exclude invalid points
      };

      const vwapData = calculateVWAP(data);
      indicatorSeries = chart.addSeries(LineSeries, {
        color: 'orange',
        lineWidth: 2,
      });
      indicatorSeries.setData(vwapData);
    }

    // Add a tooltip to display candlestick and indicator details
    const handleCrosshairMove = (param) => {
      if (!param.point) {
        setTooltip(null);
        return;
      }

      const dateStr = param.time ? new Date(param.time * 1000).toLocaleString() : '';
      
      // Find the nearest data point based on time
      const nearestPoint = data.find(point => point.time === param.time) || 
        data.reduce((nearest, current) => {
          const currentDiff = Math.abs(current.time - param.time);
          const nearestDiff = Math.abs(nearest.time - param.time);
          return currentDiff < nearestDiff ? current : nearest;
        }, data[0]);
      
      if (nearestPoint) {
        const formatPrice = (price) => {
          if (!price) return 'N/A';
          return parseFloat(price).toString();
        };

        setTooltip({
          time: dateStr,
          open: formatPrice(nearestPoint.open),
          high: formatPrice(nearestPoint.high),
          low: formatPrice(nearestPoint.low),
          close: formatPrice(nearestPoint.close),
          volume: nearestPoint.volume || 0,
          indicator: param.seriesPrices?.get(indicatorSeries)
        });
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Fit the chart content to the data
    chart.timeScale().fitContent();

    // Resize the chart when the window size changes
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.offsetWidth,
        height: chartContainerRef.current.offsetHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [data, indicator]);



  return (
    <div className='chart'>
      <div style={{
        padding: '10px',
        backgroundColor: '#080808',
        color: '#d1d4dc',
        marginBottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <TextField
          variant="outlined"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          size="small"
          style={{
            margin: '0 10px',
            width: '150px',
            height: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
          }}
          InputProps={{
            style: { color: '#000', height: '30px' },
          }}
        />
        <TextField
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          size="small"
          placeholder="Limit per page"
          style={{
            margin: '0 10px',
            width: '100px',
            height: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
          }}
          InputProps={{
            style: { color: '#000', height: '30px' },
          }}
        />
        <Select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          size="small"
          style={{
            margin: '0 10px',
            width: '150px',
            height: '30px',
            backgroundColor: '#ffffff',
          }}
          MenuProps={{
            PaperProps: {
              style: { backgroundColor: '#ffffff', color: '#000' },
            },
          }}
        >
          <MenuItem value="1min">1 Minute</MenuItem>
          <MenuItem value="5min">5 Minutes</MenuItem>
          <MenuItem value="15min">15 Minutes</MenuItem>
          <MenuItem value="30min">30 Minutes</MenuItem>
          <MenuItem value="1hour">1 Hour</MenuItem>
          <MenuItem value="4hour">4 Hours</MenuItem>
        </Select>
        <TextField
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
          }}
          style={{
            margin: '0 10px',
            width: '150px',
            height: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
          }}
          InputProps={{
            style: { color: '#000', height: '30px' },
          }}
        />
        <TextField
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
          }}
          style={{
            margin: '0 10px',
            width: '150px',
            height: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
          }}
          InputProps={{
            style: { color: '#000', height: '30px' },
          }}
        />
        <Select
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          size="small"
          style={{
            margin: '0 10px',
            width: '150px',
            height: '30px',
            backgroundColor: '#ffffff',
          }}
          MenuProps={{
            PaperProps: {
              style: { backgroundColor: '#ffffff', color: '#000' },
            },
          }}
        >
          <MenuItem value="None">None</MenuItem>
          <MenuItem value="SMA">SMA</MenuItem>
          <MenuItem value="VWAP">VWAP</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEnterClick}
          style={{
            marginLeft: '10px',
            height: '30px',
            fontSize: '12px',
            backgroundColor: '#2fa8f6',
          }}
        >
          Enter
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => setChartOpen(false)}
          style={{
            marginLeft: '60px',
            height: '30px',
            fontSize: '12px',
            backgroundColor: '#3FB923',
          }}
        >
          Close
        </Button>
      </div>
      <div
        ref={chartContainerRef}
        style={{
          top: '50px',
          left: 0,
          width: '100%',
          height: 'calc(100% - 50px)',
        }}
      />
      {tooltip && (
        <div
          style={{
            marginTop: '-10px',
            position: 'absolute',
            top: '60px',
            left: '20px', // Changed from right to left
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            color: '#d1d4dc',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid #2b2b2b'
          }}
        >
          <div style={{ marginBottom: '4px', color: '#2fa8f6', fontWeight: 'bold' }}>
            {tooltip.time || 'N/A'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 12px' }}>
            <div style={{ color: '#888' }}>Open:</div>
            <div>{tooltip.open || 'N/A'}</div>
            <div style={{ color: '#888' }}>High:</div>
            <div style={{ color: '#3FB923' }}>{tooltip.high || 'N/A'}</div>
            <div style={{ color: '#888' }}>Low:</div>
            <div style={{ color: '#ff4444' }}>{tooltip.low || 'N/A'}</div>
            <div style={{ color: '#888' }}>Close:</div>
            <div>{tooltip.close || 'N/A'}</div>
            <div style={{ color: '#888' }}>Volume:</div>
            <div>{tooltip.volume ? tooltip.volume.toLocaleString() : 'N/A'}</div>
            {indicator !== 'None' && (
              <>
                <div style={{ color: '#888' }}>{indicator}:</div>
                <div>{typeof tooltip.indicator === 'number' ? tooltip.indicator.toFixed(2) : 'N/A'}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;