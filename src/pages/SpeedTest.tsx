import React, { useState, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface SpeedometerProps {
  type: 'download' | 'upload';
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({
  type,
  value,
  onChange,
  maxValue = 1000,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const speedoRef = useRef<SVGSVGElement>(null);

  // SVG parameters
  const radius = 100;
  const normalizedRadius = radius - 10;
  const strokeWidth = 20;

  // Calculate angle from speed value
  const calculateAngleFromSpeed = (speed: number) => {
    return -180 + (speed / maxValue) * 180;
  };

  // Calculate speed from angle
  const calculateSpeedFromAngle = (angle: number) => {
    return ((angle + 180) / 180) * maxValue;
  };

  // Current angle based on value
  const angle = calculateAngleFromSpeed(value);

  // Get arc path
  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", normalizedRadius, normalizedRadius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  };

  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number) => {
    const angleInRadians = (angle) * Math.PI / 180;
    return {
      x: radius + (normalizedRadius * Math.cos(angleInRadians)),
      y: radius + (normalizedRadius * Math.sin(angleInRadians))
    };
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !speedoRef.current) return;

    const svgRect = speedoRef.current.getBoundingClientRect();
    const svgCenterX = svgRect.left + svgRect.width / 2;
    const svgCenterY = svgRect.top + svgRect.height / 2;

    const angle = Math.atan2(
      e.clientY - svgCenterY,
      e.clientX - svgCenterX
    ) * 180 / Math.PI;

    // Clamp angle between -180 and 0
    const clampedAngle = Math.max(-180, Math.min(0, angle));
    const newSpeed = calculateSpeedFromAngle(clampedAngle);
    onChange(Math.round(newSpeed));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      {/* Type Indicator */}
      <div className="mb-4 flex items-center justify-center gap-2 text-gray-400">
        {type === 'download' ? <ArrowDownIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
        <span className="text-sm font-medium">{type === 'download' ? 'Download' : 'Upload'}</span>
      </div>

      <div className="relative w-full">
        {/* Speedometer Container */}
        <div className="relative w-full pt-[50%]">
          <div className="absolute inset-0">
            <svg
              ref={speedoRef}
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              className="w-full h-full cursor-pointer"
              onMouseDown={handleMouseDown}
            >
              <defs>
                <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y1="0%">
                  <stop offset="0%" stopColor={type === 'download' ? '#2dd4bf' : '#06b6d4'} />
                  <stop offset="100%" stopColor={type === 'download' ? '#06b6d4' : '#2dd4bf'} />
                </linearGradient>
              </defs>

              {/* Speed Markers */}
              {[0, 200, 400, 600, 800, 1000].map((speed) => {
                const markerAngle = calculateAngleFromSpeed(speed);
                const markerLength = speed % 400 === 0 ? 15 : 10;
                const markerStart = normalizedRadius - markerLength;
                const markerEnd = normalizedRadius + 5;
                
                const cos = Math.cos(markerAngle * Math.PI / 180);
                const sin = Math.sin(markerAngle * Math.PI / 180);
                
                const x1 = radius + markerStart * cos;
                const y1 = radius + markerStart * sin;
                const x2 = radius + markerEnd * cos;
                const y2 = radius + markerEnd * sin;
                
                const textDistance = normalizedRadius - 25;
                const textX = radius + textDistance * cos;
                const textY = radius + textDistance * sin;

                return (
                  <g key={speed}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(55, 65, 81, 0.3)"
                      strokeWidth="2"
                    />
                    {speed % 200 === 0 && (
                      <text
                        x={textX}
                        y={textY}
                        fill="rgba(156, 163, 175, 0.5)"
                        fontSize="12"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ userSelect: 'none' }}
                      >
                        {speed}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Background Arc */}
              <path
                d={getArcPath(-180, 0)}
                fill="none"
                stroke="rgba(31, 41, 55, 0.3)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Progress Arc */}
              <path
                d={getArcPath(-180, angle)}
                fill="none"
                stroke="url(#speedGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  transition: isDragging ? 'none' : 'all 0.3s ease-out'
                }}
              />
            </svg>
          </div>
        </div>

        {/* Speed Value */}
        <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 transform">
          {isEditing ? (
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(Math.min(maxValue, Math.max(0, Number(e.target.value))))}
              onBlur={() => setIsEditing(false)}
              className="w-24 text-4xl font-bold text-cyan-400 bg-transparent border-none text-center focus:ring-0"
              autoFocus
            />
          ) : (
            <div 
              className="text-4xl font-bold text-cyan-400 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {value.toFixed(0)}
              <span className="text-sm font-normal text-gray-400 ml-1">Mbps</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SpeedTest: React.FC = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Speed Test</h1>
        
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
          <Speedometer
            type="download"
            value={downloadSpeed}
            onChange={setDownloadSpeed}
          />
          <Speedometer
            type="upload"
            value={uploadSpeed}
            onChange={setUploadSpeed}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
