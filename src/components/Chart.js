import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Select, MenuItem } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import ReplayIcon from '@mui/icons-material/Replay';
import { calculateMA, convertToRawData } from '../helpers';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { formatISO, subDays } from 'date-fns'; // Import date-fns for date manipulation
import marketPriceApi from '../api/marketPriceApi'; // Import your market price API

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

  const signal = signals[0];

  const entryPrice = signal?.signal_price || 0;
  const isBuy = signal?.signal?.toLowerCase() === 'buy';
  const aboveEntryPrice = signal?.take_profit || 0;
  const belowEntryPrice = signal?.stop_loss || 0;

  useEffect(() => {
    if (initialData) {
      const symbol = initialData.symbol || initialData.symbol || 'XAUUSD';
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

  const fetchData = async (ptSymbol, psTimeFrame, psDefaultFromDate, psDefaultToDate) => {

    ptSymbol = ptSymbol || symbol;
    psTimeFrame = psTimeFrame || timeFrame;
    psDefaultFromDate = psDefaultFromDate || fromDate;
    psDefaultToDate = psDefaultToDate || toDate;
    try {

      const response = await marketPriceApi.fetchMarketPrice(ptSymbol, psTimeFrame, psDefaultFromDate, psDefaultToDate, fetchDbData);
      const result = await response.data;

      // Convert the API data to the required format
      const formattedData = result
        .map((item, index) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000) + index, // Add index to ensure unique time
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        }))
        .sort((a, b) => a.time - b.time); // Sort by time

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    const handleCrosshairMove = (event) => {
      if (!event.time || !event.seriesData) {
        setTooltip(null);
        return;
      }

      const seriesData = event.seriesData.get(candlestickSeries);
      const indicatorPoint =
        indicatorSeries && indicatorSeries.data().find((point) => point.time === event.time);

      if (seriesData) {
        setTooltip({
          time: new Date(event.time * 1000).toLocaleString(),
          open: seriesData.open,
          high: seriesData.high,
          low: seriesData.low,
          close: seriesData.close,
          volume: seriesData.volume,
          indicator: indicatorPoint ? indicatorPoint.value : 'N/A',
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
        <div>
          <div>Time: {tooltip.time}</div>
          <div>Open: {tooltip.open}</div>
          <div>High: {tooltip.high}</div>
          <div>Low: {tooltip.low}</div>
          <div>Close: {tooltip.close}</div>
          <div>Volume: {tooltip.volume}</div>
          <div>{indicator}: {tooltip.indicator}</div>
        </div>
      )}
    </div>
  );
};

export default Chart;