import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import ReplayIcon from '@mui/icons-material/Replay';
import { calculateMA, convertToRawData } from '../helpers';

const Chart = ({ setChartOpen, focusedSetup, signals }) => {
  const initialData = focusedSetup?.price_data;
  const [replayOpen, setReplayOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [priceData, setPriceData] = useState(initialData);
  const [dataCounter, setDataCounter] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  let replayData = false;

  const signal = signals[0];

  const entryLabel = signal?.signal || 'Entry';
  const entryPrice = signal?.signal_price || 0;
  const isBuy = signal?.signal?.toLowerCase() === 'buy';
  const aboveEntryPrice = signal?.take_profit || 0;
  const belowEntryPrice = signal?.stop_loss || 0;

  const trendLineY1 = 100;
  const trendLineY2 = 120;

  useEffect(() => {
    if (initialData) {
      setPriceData(initialData);
    }

  }, [initialData]);

  const rawData = replayData || priceData?.length > 0 ? convertToRawData(priceData) : [];

  const dates = rawData?.map(function (item) {
    return item[0];
  }).reverse();
  const data = rawData?.map(function (item) {
    return [+item[1], +item[2], +item[5], +item[6]];
  }).reverse();

  const handleReplayClick = () => {
    setReplayOpen(true);
  };

  const handleReplayClose = () => {
    setReplayOpen(false);
  };

  const handleReplay = () => {
    const tempData = [];
    replayData = []
    let counter = 0;

    priceData.forEach((item) => {
      if (item.date >= startDate && item.date <= endDate) {
        tempData.push(item);
      }
    });


    setPriceData([]);
    setDataCounter(0);

    const id = setInterval(() => {
      const arrData = [...replayData];
      arrData.push(tempData[counter]);
      replayData = arrData;
      counter++

    }, replaySpeed * 1000);

    setIntervalId(id);
    setReplayOpen(false);
  };


  const option = {
    legend: {
      data: ['Day', 'MA5', 'MA10', 'MA20', 'MA30'],
      inactiveColor: '#777',
      selected: {
        'MA5': false,
        'MA10': false,
        'MA20': false,
        'MA30': false
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        type: 'cross',
        lineStyle: {
          color: '#376df4',
          width: 2,
          opacity: 1
        }
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#8392A5' } },
      axisLabel: {
        align: 'left' // Align the labels to the left
      }
    },
    yAxis: {
      scale: true,
      position: 'right', // Position the y-axis labels on the right side
      axisLine: { lineStyle: { color: '#8392A5' } },
      splitLine: { show: false },
      axisLabel: {
        align: 'right' // Align the labels to the right
      }
    },
    grid: {
      bottom: 80
    },
    dataZoom: [
      {
        textStyle: {
          color: '#8392A5'
        },
        handleIcon:
          'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        dataBackground: {
          areaStyle: {
            color: '#8392A5'
          },
          lineStyle: {
            opacity: 0.8,
            color: '#8392A5'
          }
        },
        brushSelect: true
      },
      {
        type: 'inside'
      }
    ],
    series: [
      {
        type: 'candlestick',
        name: 'Day',
        data: data,
        itemStyle: {
          color: '#FD1050',
          color0: '#0CF49B',
          borderColor: '#FD1050',
          borderColor0: '#0CF49B'
        },
        markLine: {
          symbol: ['none', 'none'],
          data: [
            { name: entryLabel, yAxis: entryPrice, lineStyle: { color: 'orange' } },
            { name: isBuy ? 'TP' : 'SL', yAxis: aboveEntryPrice, lineStyle: { color: isBuy ? 'green' : 'red' } },
            { name: !isBuy ? 'TP' : 'SL', yAxis: belowEntryPrice, lineStyle: { color: !isBuy ? 'green' : 'red' } },
            [
              {
                name: 'Trendline',
                coord: [0, trendLineY1],
                symbol: 'none',
                lineStyle: { type: 'solid', color: 'purple' },
              },
              {
                coord: [dates.length - 1, trendLineY2],
                symbol: 'none'
              }
            ]
          ],
          label: {
            position: 'start', // Position the label at the end of the line (right side)
            formatter: (params) => {
              if (params.name === 'Trendline') {
                return '';
              }
              return `${params.name}: ${params.value}`;
            }
          }
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5, data),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, data),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(20, data),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: calculateMA(30, data),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      }
    ],
  };

  return (
    <div className='chart'>
      <div className='title'>
        <h4>Chart</h4>


        <div>
          <Button
            variant="outlined"
            onClick={handleReplayClick}
            sx={{
              marginRight: '10px',
              color: 'white',
              backgroundColor: '#2fa8f6',
            }}
          >
            Replay
          </Button>

          <Button variant="outlined" onClick={() => setChartOpen(false)}>
            Close
          </Button>
        </div>

      </div>
      <ReactECharts option={option} style={{
        height: '600px',
        width: '100%',
      }} />


      <Dialog open={replayOpen} onClose={handleReplayClose} PaperProps={{ sx: { backgroundColor: '#232323', color: 'white' } }}>
        <DialogTitle sx={{ color: 'white' }}>Replay Chart</DialogTitle>
        <DialogContent>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: { color: 'white' }
            }}
            InputProps={{
              style: { color: 'white' }
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: { color: 'white' }
            }}
            InputProps={{
              style: { color: 'white' }
            }}
            sx={{ marginTop: '20px' }}
          />
          <TextField
            label="Replay Speed (seconds per step)"
            type="number"
            value={replaySpeed}
            onChange={(e) => setReplaySpeed(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
              style: { color: 'white' }
            }}
            InputProps={{
              style: { color: 'white' }
            }}
            sx={{ marginTop: '20px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReplayClose} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button onClick={handleReplay} sx={{ color: 'white' }}>
            Replay
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
};

export default Chart;