import React, { useState } from 'react';
import { AlertTriangle, Wifi, Edit2, X, ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import useDevice from '../hooks/useDevice';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedTestData {
  download: number;
  upload: number;
  type: 'download' | 'upload';
}

interface BuyoutBreakdown {
  monthlyBill: number;
  monthsRemaining: number;
  totalWithVAT: number;
  vatAmount: number;
  totalExVAT: number;
  contribution: number;
  customerPayment: number;
}

const BuyoutCalculator: React.FC = () => {
  const { isMobile } = useDevice();
  const [provider, setProvider] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [estimatedSpeed, setEstimatedSpeed] = useState(0);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [actualSpeed, setActualSpeed] = useState<SpeedTestData>({ download: 0, upload: 0, type: 'download' });
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom'>('preset');
  const [contractLength, setContractLength] = useState('6');
  const [customDate, setCustomDate] = useState('');

  const BUYOUT_CONTRIBUTION = 300; // £300 contribution
  const VAT_RATE = 0.20; // 20% VAT

  const providers = ['BT', 'Sky', 'TalkTalk', 'Virgin Media', 'Vodafone', 'Other'];
  const presetPeriods = [
    { label: isMobile ? '6M' : '6 Months', value: '6' },
    { label: isMobile ? '12M' : '12 Months', value: '12' },
    { label: isMobile ? '18M' : '18 Months', value: '18' },
    { label: isMobile ? '24M' : '24 Months', value: '24' }
  ];

  const calculateMonthsRemaining = () => {
    if (contractEndType === 'preset') {
      return parseInt(contractLength);
    } else if (customDate) {
      const end = new Date(customDate);
      const now = new Date();
      const months = (end.getFullYear() - now.getFullYear()) * 12 + 
                    (end.getMonth() - now.getMonth());
      return Math.max(0, months);
    }
    return 0;
  };

  const calculateBreakdown = (): BuyoutBreakdown => {
    const monthlyAmount = parseFloat(monthlyBill) || 0;
    const months = calculateMonthsRemaining();
    const totalWithVAT = monthlyAmount * months;
    const totalExVAT = totalWithVAT / (1 + VAT_RATE);
    const vatAmount = totalWithVAT - totalExVAT;
    const customerPayment = Math.max(0, totalExVAT - BUYOUT_CONTRIBUTION);
    
    return {
      monthlyBill: monthlyAmount,
      monthsRemaining: months,
      totalWithVAT,
      vatAmount,
      totalExVAT,
      contribution: Math.min(BUYOUT_CONTRIBUTION, totalExVAT),
      customerPayment
    };
  };

  const breakdown = calculateBreakdown();
  const canBuyoutInFull = breakdown.customerPayment === 0;

  const Speedometer: React.FC<{ 
    value: number; 
    maxValue?: number;
    onChange: (value: number) => void;
    type: 'download' | 'upload';
  }> = ({ value, maxValue = 1000, onChange, type }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const speedoRef = React.useRef<SVGSVGElement>(null);

    const calculateSpeedFromAngle = (angle: number) => {
      return ((angle + 180) / 180) * maxValue;
    };

    const calculateAngleFromSpeed = (speed: number) => {
      return (speed / maxValue) * 180 - 180;
    };

    const calculateSpeedFromMousePosition = (event: React.MouseEvent | MouseEvent) => {
      if (!speedoRef.current) return;

      const svgRect = speedoRef.current.getBoundingClientRect();
      const svgPoint = speedoRef.current.createSVGPoint();
      
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;
      
      const transformedPoint = svgPoint.matrixTransform(speedoRef.current.getScreenCTM()?.inverse());
      
      // Calculate distance from center to check if we're near the arc
      const dx = transformedPoint.x - 150;
      const dy = transformedPoint.y - 150;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      // Only process if we're near the arc (within 20 pixels)
      if (Math.abs(distanceFromCenter - 130) <= 20) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Normalize angle to -180 to 0 range
        if (angle < -180) angle = -180;
        if (angle > 0) angle = 0;

        const newSpeed = Math.round(calculateSpeedFromAngle(angle));
        onChange(Math.min(maxValue, Math.max(0, newSpeed)));
      }
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      const svgRect = speedoRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const svgPoint = speedoRef.current!.createSVGPoint();
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;
      
      const transformedPoint = svgPoint.matrixTransform(speedoRef.current!.getScreenCTM()?.inverse());
      
      // Check if click is near the arc
      const dx = transformedPoint.x - 150;
      const dy = transformedPoint.y - 150;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      if (Math.abs(distanceFromCenter - 130) <= 20) {
        setIsDragging(true);
        calculateSpeedFromMousePosition(event);
      }
      event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        calculateSpeedFromMousePosition(event);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

    const radius = 150;
    const strokeWidth = 16;
    const normalizedRadius = radius - strokeWidth / 2;
    const angle = calculateAngleFromSpeed(value);

    const getArcPath = (startAngle: number, endAngle: number) => {
      const startRad = (startAngle) * (Math.PI / 180);
      const endRad = (endAngle) * (Math.PI / 180);
      
      const startPoint = {
        x: radius + (normalizedRadius * Math.cos(startRad)),
        y: radius + (normalizedRadius * Math.sin(startRad))
      };
      
      const endPoint = {
        x: radius + (normalizedRadius * Math.cos(endRad)),
        y: radius + (normalizedRadius * Math.sin(endRad))
      };

      const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
      return `M ${startPoint.x} ${startPoint.y} A ${normalizedRadius} ${normalizedRadius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
    };

    return (
      <div className="relative w-full max-w-[500px] mx-auto">
        {/* Type Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 text-gray-400">
          {type === 'download' ? <ArrowDownIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
          <span className="text-sm font-medium">{type === 'download' ? 'Download' : 'Upload'}</span>
        </div>

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
        <div className="mt-8 text-center">
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
    );
  };

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <div className="grid gap-6">
        {/* Provider Selection */}
        <motion.div
          className="space-y-4 rounded-xl bg-card/50 p-6"
          animate={{ opacity: 1 }}
        >
          <h3 className="text-lg font-medium">Who's your provider?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providers.map(p => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setProvider(p)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  provider === p
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-transparent bg-card/50 hover:border-primary/20'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Monthly Bill */}
        <motion.div 
          className="rounded-xl bg-card/50 p-6"
          animate={{ opacity: provider ? 1 : 0.8 }}
        >
          <h3 className="text-lg font-medium mb-4">Monthly Bill</h3>
          {isEditingBill ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
              <input
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                onBlur={() => setIsEditingBill(false)}
                autoFocus
                className="w-full p-3 pl-8 bg-transparent border-none focus:ring-0 text-xl font-medium"
                placeholder="0.00"
                step="0.01"
              />
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center justify-between group cursor-pointer"
              onClick={() => setIsEditingBill(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl font-medium">
                {monthlyBill ? `£${parseFloat(monthlyBill).toFixed(2)}` : 'Click to enter'}
              </span>
              <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )}
        </motion.div>

        {/* Contract Length */}
        <motion.div
          className="rounded-xl bg-card/50 p-6 space-y-4"
          animate={{ opacity: estimatedSpeed ? 1 : 0.8 }}
        >
          <h3 className="text-lg font-medium">Contract Length</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presetPeriods.map(period => (
              <motion.button
                key={period.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setContractEndType('preset');
                  setContractLength(period.value);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contractEndType === 'preset' && contractLength === period.value
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-transparent bg-card/50 hover:border-primary/20'
                }`}
              >
                {period.label}
              </motion.button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setContractEndType('custom');
                setCustomDate(e.target.value);
              }}
              className="w-full p-4 rounded-lg bg-transparent border border-border/50 focus:border-primary focus:ring-0 text-base"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </motion.div>

        {/* Speed Test */}
        <motion.div
          className="rounded-xl bg-card/50 p-6 space-y-4"
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Speed Test</h3>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActualSpeed({ ...actualSpeed, type: actualSpeed.type === 'download' ? 'upload' : 'download' })}
                className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg flex items-center gap-2 transition-all"
              >
                {actualSpeed.type === 'download' ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
                {actualSpeed.type === 'download' ? 'Download' : 'Upload'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSpeedTest(!showSpeedTest)}
                className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg flex items-center gap-2 transition-all"
              >
                <Wifi className="w-4 h-4" />
                Test Now
              </motion.button>
            </div>
          </div>

          <Speedometer 
            value={actualSpeed.type === 'download' ? actualSpeed.download : actualSpeed.upload}
            maxValue={1000}
            onChange={(value) => setActualSpeed(prev => ({
              ...prev,
              [prev.type]: value
            }))}
            type={actualSpeed.type}
          />

          <AnimatePresence>
            {showSpeedTest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    Ping
                  </div>
                  <span>{actualSpeed.download > 0 || actualSpeed.upload > 0 ? '9ms' : '--'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary */}
        <motion.div
          className={`p-6 rounded-xl border-2 space-y-4 ${
            canBuyoutInFull 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-yellow-500/5 border-yellow-500/20'
          }`}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Breakdown</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 overflow-hidden"
          >
            <div className="grid gap-2">
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-gray-500">Monthly Bill</span>
                <span className="font-medium">£{breakdown.monthlyBill.toFixed(2)}</span>
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-gray-500">Months Remaining</span>
                <span className="font-medium">{breakdown.monthsRemaining}</span>
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-gray-500">Total (inc. VAT)</span>
                <span className="font-medium">£{breakdown.totalWithVAT.toFixed(2)}</span>
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-gray-500">VAT Amount</span>
                <span className="font-medium">£{breakdown.vatAmount.toFixed(2)}</span>
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-gray-500">Our Contribution</span>
                <span className="font-medium text-green-500">-£{breakdown.contribution.toFixed(2)}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Final Payment</span>
              <span className={`text-2xl font-bold ${canBuyoutInFull ? 'text-green-500' : 'text-yellow-500'}`}>
                {canBuyoutInFull ? '£0.00' : `£${breakdown.customerPayment.toFixed(2)}`}
              </span>
            </div>
            <p className={`mt-2 text-sm ${canBuyoutInFull ? 'text-green-600/80' : 'text-yellow-600/80'}`}>
              {canBuyoutInFull 
                ? 'Great news! We\'ll cover your entire buyout cost.'
                : 'Additional payment needed to complete your buyout.'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyoutCalculator;
