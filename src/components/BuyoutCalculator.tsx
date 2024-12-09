import React, { useState } from 'react';
import { AlertTriangle, Wifi, Edit2, X } from 'lucide-react';
import useDevice from '../hooks/useDevice';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedTestData {
  download: number;
  upload: number;
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
  const [actualSpeed, setActualSpeed] = useState<SpeedTestData>({ download: 0, upload: 0 });
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

        {/* Speed Test */}
        <motion.div
          className="rounded-xl bg-card/50 p-6 space-y-6"
          animate={{ opacity: monthlyBill ? 1 : 0.8 }}
        >
          <h3 className="text-lg font-medium">Speed Check</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl font-semibold"
              >
                {estimatedSpeed} <span className="text-base font-normal text-gray-500">Mbps</span>
              </motion.span>
            </div>
            <div className="relative h-3 rounded-full bg-primary/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(estimatedSpeed / 1000) * 100}%` }}
                className="absolute inset-0 bg-primary"
                transition={{ type: "spring", stiffness: 100 }}
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={estimatedSpeed}
                onChange={(e) => setEstimatedSpeed(parseInt(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSpeedTest(!showSpeedTest)}
            className="w-full p-4 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Wifi className="w-5 h-5" />
            Speed Test
          </motion.button>

          <AnimatePresence>
            {showSpeedTest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Download</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={actualSpeed.download}
                        onChange={(e) => setActualSpeed({ ...actualSpeed, download: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-transparent border-none focus:ring-0 text-xl font-medium"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Mbps</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500">Upload</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={actualSpeed.upload}
                        onChange={(e) => setActualSpeed({ ...actualSpeed, upload: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-transparent border-none focus:ring-0 text-xl font-medium"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Mbps</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
