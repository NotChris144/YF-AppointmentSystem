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
    const speedoRef = React.useRef<HTMLDivElement>(null);

    const calculateSpeedFromAngle = (angle: number) => {
      // Convert angle (0-180) to speed (0-maxValue)
      return (angle / 180) * maxValue;
    };

    const calculateAngleFromSpeed = (speed: number) => {
      // Convert speed to angle (0-180)
      return (speed / maxValue) * 180;
    };

    const calculateSpeedFromMousePosition = (event: React.MouseEvent | MouseEvent) => {
      if (!speedoRef.current) return;

      const rect = speedoRef.current.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top;
      
      // Calculate angle from mouse position relative to center
      const angle = Math.atan2(
        event.clientX - centerX,
        -(event.clientY - centerY)
      ) * (180 / Math.PI);

      // Clamp angle between 0 and 180
      const clampedAngle = Math.max(0, Math.min(180, angle));
      const newSpeed = Math.round(calculateSpeedFromAngle(clampedAngle));
      onChange(newSpeed);
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      setIsDragging(true);
      calculateSpeedFromMousePosition(event);
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

    const angle = calculateAngleFromSpeed(value);
    const gradientStops = [
      { color: '#06b6d4', position: 0 },    // cyan-500
      { color: '#06b6d4', position: 20 },   // cyan-500
      { color: '#2dd4bf', position: 40 },   // teal-400
      { color: '#34d399', position: 60 },   // emerald-400
      { color: '#6ee7b7', position: 80 },   // emerald-300
      { color: '#a7f3d0', position: 100 },  // emerald-200
    ];

    return (
      <div className="relative w-full aspect-[4/3] flex items-center justify-center">
        {/* Background Arc */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            ref={speedoRef}
            className="w-4/5 h-4/5 rounded-full border-[16px] border-gray-800/30 cursor-pointer" 
            style={{ 
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
              transform: 'rotate(180deg)'
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
        
        {/* Colored Progress Arc */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 h-4/5 rounded-full border-[16px]"
               style={{
                 clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                 borderImage: `conic-gradient(
                   from 0deg,
                   ${type === 'download' 
                     ? '#2dd4bf 0%, #06b6d4 100%'  // teal to cyan for download
                     : '#06b6d4 0%, #2dd4bf 100%'  // cyan to teal for upload
                   }
                 ) 1`,
                 transform: `rotate(${180 + angle}deg)`,
                 transition: isDragging ? 'none' : 'transform 0.3s ease-out'
               }} />
        </div>

        {/* Speed Markers */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 h-4/5 relative">
            {[0, 200, 400, 600, 800, 1000].map((marker) => {
              const markerAngle = (marker / maxValue) * 180;
              return (
                <div
                  key={marker}
                  className="absolute left-1/2 top-0 -translate-x-1/2 origin-[50%_100%] text-gray-500/50 text-xs"
                  style={{ transform: `rotate(${markerAngle}deg)` }}
                >
                  <div className="h-3 w-px bg-gray-700/30 mb-1" />
                  <span 
                    className="inline-block" 
                    style={{ 
                      transform: `rotate(180deg)`,
                      opacity: marker % 400 === 0 ? 1 : 0.5
                    }}
                  >
                    {marker}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Speed Display */}
        <div className="absolute bottom-8 text-center">
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
            <>
              <div 
                className="text-4xl font-bold text-cyan-400 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {value.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">Mbps</div>
            </>
          )}
        </div>

        {/* Speed Type Indicator */}
        <div className="absolute top-0 text-center">
          <div className="flex items-center gap-2 text-gray-400 pb-4">
            {type === 'download' ? <ArrowDownIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
            <span className="text-sm font-medium">{type === 'download' ? 'Download' : 'Upload'}</span>
          </div>
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
