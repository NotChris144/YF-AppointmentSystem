import React from 'react';
import Slider from './ui/Slider';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SpeedVerificationProps {
  estimatedSpeed: number;
  actualSpeed: number | null;
  onEstimatedSpeedChange: (speed: number) => void;
  onActualSpeedChange: (speed: number) => void;
  isCorrect: boolean | null;
  onIsCorrectChange: (isCorrect: boolean) => void;
}

const SpeedVerification: React.FC<SpeedVerificationProps> = ({
  estimatedSpeed,
  actualSpeed,
  onEstimatedSpeedChange,
  onActualSpeedChange,
  isCorrect,
  onIsCorrectChange,
}) => {
  const speedDifference = actualSpeed !== null ? ((estimatedSpeed - actualSpeed) / estimatedSpeed) * 100 : 0;
  const hasSignificantDrop = speedDifference > 20;

  return (
    <div className="space-y-4">
      <Slider
        label="Estimated Speed (Mbps)"
        value={estimatedSpeed}
        onChange={onEstimatedSpeedChange}
        min={0}
        max={1000}
        step={1}
      />

      <div className="flex items-center space-x-4 py-2">
        <span className="text-sm font-medium text-gray-200">Is this the actual speed?</span>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              onIsCorrectChange(true);
              onActualSpeedChange(estimatedSpeed);
            }}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              isCorrect === true
                ? "bg-success text-white"
                : "bg-background text-gray-400 hover:text-white"
            )}
          >
            Yes
          </button>
          <button
            onClick={() => {
              onIsCorrectChange(false);
              if (actualSpeed === null) {
                onActualSpeedChange(Math.floor(estimatedSpeed * 0.8));
              }
            }}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              isCorrect === false
                ? "bg-error text-white"
                : "bg-background text-gray-400 hover:text-white"
            )}
          >
            No
          </button>
        </div>
      </div>

      {isCorrect === false && (
        <div className="space-y-4">
          <Slider
            label="Actual Speed (Mbps)"
            value={actualSpeed || 0}
            onChange={onActualSpeedChange}
            min={0}
            step={1}
          />
          
          {hasSignificantDrop && actualSpeed !== null && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning">
                  Significant Speed Difference Detected
                </p>
                <p className="text-sm text-muted">
                  You're getting {speedDifference.toFixed(0)}% less than your expected speed. 
                  This suggests your current provider isn't delivering the promised performance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeedVerification;