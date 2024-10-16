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
  