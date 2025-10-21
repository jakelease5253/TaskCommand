import { useState, useEffect } from 'react';

export function useTimer() {
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const start = () => {
    setIsRunning(true);
    setStartTime(Date.now() - (elapsed * 1000));
  };

  const pause = () => {
    setIsRunning(false);
  };

  const stop = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
  };

  const reset = () => {
    setElapsed(0);
    setStartTime(Date.now());
  };

  return {
    elapsed,
    isRunning,
    startTime,
    start,
    pause,
    stop,
    reset,
    setStartTime,
    setElapsed
  };
}
