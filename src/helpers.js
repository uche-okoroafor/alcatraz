import moment from "moment/moment";

export const calculateTimeout = (timeInterval) => {
    const value = Number(timeInterval.replace(/[^\d.]/g, ""));
    const unit = timeInterval.replace(/[\d.]/g, "");
  
    switch (unit) {
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      case "w":
        return value * 604800;
      case "mo":
        return value * 2629743;
      default:
        return 0;
    }
  };

    // return priceData
    // .map(item => ({
    //   date: new Date(item.date),
    //   open: item.open,
    //   low: item.low,
    //   high: item.high,
    //   close: item.close,
    //   volume: item.volume
    // }))
    // .sort((a, b) => a.date - b.date)
    // .map(item => [
    //   item.date.toISOString().slice(0, 19).replace('T', ' '), // Format date as "YYYY-MM-DD HH:MM:SS"
    //   item.open,
    //   item.close,
    //   item.low,
    //   item.high,
    //   item.volume
    // ]);
  

   export function convertToRawData(priceData) {

      return priceData.map(data => {
          const date = data.date.replace(/-/g, '/'); // Convert date to 'YYYY/MM/DD' format
          const open = data.open.toFixed(2);
          const close = data.close.toFixed(2);
          const change = (data.close - data.open).toFixed(2);
          const percentageChange = ((change / data.open) * 100).toFixed(2) + '%';
          const low = data.low.toFixed(2);
          const high = data.high.toFixed(2);
          const volume = data.volume.toString();
          const volumeRelatedField = '-'; // Placeholder for the volume-related field
  
          return [date, open, close, change, percentageChange, low, high, volume, volumeRelatedField];
      });
  }
  
  export const calculateMA = (dayCount, data) => {
    const result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      result.push(sum / dayCount);
    }
    return result;
  };