import React from "react";
import { Play, Pause, Square, Clock } from "../ui/icons";

export default function WorkTimer({
  elapsed,
  isRunning,
  onToggle,
  onStop,
  formatTime,
}) {
  return (
    <div className="mb-6 gradient-primary rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-semibold">Work Session Timer</h3>
            <p className="text-white text-opacity-90 text-sm">Track your total work time</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-4xl font-mono font-bold timer-display">
            {formatTime(elapsed)}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors backdrop-blur-sm"
              title={isRunning ? "Pause" : "Start"}
            >
              {isRunning ? <Pause /> : <Play />}
            </button>
            <button
              type="button"
              onClick={onStop}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors backdrop-blur-sm"
              title="Stop and Reset"
            >
              <Square />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}