import React from "react";
import { Play, Pause, Square, Clock } from "../ui/icons";

export default function WorkTimer({
  title = "Work Session Timer",
  subtitle = "Track your total work time today",
  elapsedText = "00:00:00",
  isRunning = false,
  onToggle,
  onStop,
}) {
  return (
    <div className="mb-6 gradient-primary rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Clock />
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-white text-opacity-90 text-sm">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono font-medium timer-display">
            {elapsedText}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors backdrop-blur-sm"
            >
              {isRunning ? <Pause /> : <Play />}
            </button>
            <button
              type="button"
              onClick={onStop}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors backdrop-blur-sm"
            >
              <Square />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
