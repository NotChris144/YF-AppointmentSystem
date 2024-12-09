import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, ChevronRight, X, ArrowLeft, ArrowRight, Edit2 } from 'lucide-react';
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
  const { isMobile, isTablet } = useDevice();
  const [currentStep, setCurrentStep] = useState(1);
  const [provider, setProvider] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [estimatedSpeed, setEstimatedSpeed] = useState(0);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [actualSpeed, setActualSpeed] = useState<SpeedTestData>({ download: 0, upload: 0 });
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom'>('preset');
  const [contractLength, setContractLength] = useState('6');
  const [customDate, setCustomDate] = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

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

  const hasSpeedDifference = () => {
    return actualSpeed.download > 0 && 
           Math.abs(estimatedSpeed - actualSpeed.download) / estimatedSpeed > 0.2;
  };

  const steps = [
    { title: 'Provider Details', isComplete: !!provider && !!monthlyBill },
    { title: 'Speed Check', isComplete: estimatedSpeed > 0 },
    { title: 'Contract Length', isComplete: contractEndType === 'preset' ? !!contractLength : !!customDate }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > index + 1 || step.isComplete
                ? 'bg-primary text-white'
                : currentStep === index + 1
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-200 text-gray-400'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {currentStep > index + 1 || step.isComplete ? '✓' : index + 1}
          </motion.div>
          {index < steps.length - 1 && (
            <div className={`w-full h-1 mx-2 ${
              currentStep > index + 1
                ? 'bg-primary'
                : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Who's your provider?</h3>
                <div className="grid grid-cols-2 gap-3">
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
              </div>

              <motion.div 
                className="relative rounded-xl bg-card/50 p-4"
                animate={{ opacity: provider ? 1 : 0.5 }}
              >
                <h3 className="text-sm text-gray-500 mb-2">Monthly Bill</h3>
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
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-4">What speed are you getting?</h3>
              <motion.div
                className="rounded-xl bg-card/50 p-6 space-y-6"
                animate={{ opacity: estimatedSpeed ? 1 : 0.8 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.span
                      initial={{ scale: 0 }}
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
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-4">How long is left on your contract?</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
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
                
                <motion.div 
                  className="rounded-xl bg-card/50 p-4"
                  animate={{ opacity: contractEndType === 'custom' ? 1 : 0.8 }}
                >
                  <h3 className="text-sm text-gray-500 mb-2">Custom Date</h3>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setContractEndType('custom');
                      setCustomDate(e.target.value);
                    }}
                    className="w-full p-3 bg-transparent border-none focus:ring-0 text-xl font-medium"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const breakdown = calculateBreakdown();
  const canBuyoutInFull = breakdown.customerPayment === 0;

  return (
    <div className="relative min-h-[500px] flex flex-col">
      <div className="flex-1 px-4 pb-24">
        {renderStepIndicator()}
        {renderCurrentStep()}
      </div>

      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className={`p-3 rounded-xl ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary/10'
            }`}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (currentStep === steps.length) {
                setShowBottomSheet(true);
              } else {
                setCurrentStep(prev => Math.min(steps.length, prev + 1));
              }
            }}
            className="px-8 py-3 bg-primary text-white rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {currentStep === steps.length ? 'View Summary' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showBottomSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowBottomSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6 space-y-6 max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Buyout Summary</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBottomSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <span className="text-gray-500">Monthly Bill</span>
                    <span className="text-lg font-medium">£{breakdown.monthlyBill.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <span className="text-gray-500">Months Remaining</span>
                    <span className="text-lg font-medium">{breakdown.monthsRemaining}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <span className="text-gray-500">Total (inc. VAT)</span>
                    <span className="text-lg font-medium">£{breakdown.totalWithVAT.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <span className="text-gray-500">VAT Amount</span>
                    <span className="text-lg font-medium">£{breakdown.vatAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <span className="text-gray-500">Our Contribution</span>
                    <span className="text-lg font-medium text-green-500">-£{breakdown.contribution.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl ${
                    canBuyoutInFull 
                      ? 'bg-green-500/5 border-2 border-green-500/20' 
                      : 'bg-yellow-500/5 border-2 border-yellow-500/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Final Payment</span>
                      <span className={`text-2xl font-bold ${canBuyoutInFull ? 'text-green-500' : 'text-yellow-500'}`}>
                        {canBuyoutInFull ? '£0.00' : `£${breakdown.customerPayment.toFixed(2)}`}
                      </span>
                    </div>
                    
                    {canBuyoutInFull ? (
                      <p className="text-green-600/80">
                        Great news! We'll cover your entire buyout cost.
                      </p>
                    ) : (
                      <p className="text-yellow-600/80">
                        Additional payment needed to complete your buyout.
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyoutCalculator;
