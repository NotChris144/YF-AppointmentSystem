import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, Info, ChevronRight, X, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [estimatedSpeed, setEstimatedSpeed] = useState(0);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [actualSpeed, setActualSpeed] = useState<SpeedTestData>({ download: 0, upload: 0 });
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom'>('preset');
  const [contractLength, setContractLength] = useState('6');
  const [customDate, setCustomDate] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Current Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map(p => (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProvider(p)}
                      className={`p-4 rounded-lg border ${
                        provider === p
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      } transition-colors`}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Monthly Cost (£)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
                  <input
                    type="number"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    className="w-full p-3 pl-8 rounded-lg border border-input bg-background hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Estimated Speed</label>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full bg-primary/10 text-primary"
                    >
                      {estimatedSpeed} Mbps
                    </motion.span>
                  </div>
                  <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(estimatedSpeed / 1000) * 100}%` }}
                      className="h-full bg-primary"
                      transition={{ type: "spring", stiffness: 100 }}
                    />
                  </div>
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
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSpeedTest(!showSpeedTest)}
                className="w-full p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Wifi className="w-5 h-5" />
                Run Speed Test
              </motion.button>

              <AnimatePresence>
                {showSpeedTest && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 p-4 bg-card rounded-lg border border-border/50"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-2">Download (Mbps)</label>
                        <input
                          type="number"
                          value={actualSpeed.download}
                          onChange={(e) => setActualSpeed({ ...actualSpeed, download: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 rounded-lg border border-input bg-background hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2">Upload (Mbps)</label>
                        <input
                          type="number"
                          value={actualSpeed.upload}
                          onChange={(e) => setActualSpeed({ ...actualSpeed, upload: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 rounded-lg border border-input bg-background hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <label className="block font-medium mb-2">Contract End Date</label>
              <div className="grid grid-cols-2 gap-2">
                {presetPeriods.map(period => (
                  <motion.button
                    key={period.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setContractEndType('preset');
                      setContractLength(period.value);
                    }}
                    className={`p-4 rounded-lg border ${
                      contractEndType === 'preset' && contractLength === period.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    } transition-colors`}
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
                  className="w-full p-4 rounded-lg border border-input bg-background hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
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
    <div className={`relative ${isMobile ? 'text-sm' : 'text-base'}`}>
      {renderStepIndicator()}
      
      <div className="px-4">
        {renderCurrentStep()}
      </div>

      <div className="mt-8 px-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className={`p-3 rounded-lg ${
            currentStep === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary/10'
          }`}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (currentStep === steps.length) {
              setShowBottomSheet(true);
            } else {
              setCurrentStep(prev => Math.min(steps.length, prev + 1));
            }
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg flex items-center gap-2"
        >
          {currentStep === steps.length ? 'View Summary' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showBottomSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowBottomSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Buyout Summary</h3>
                <button
                  onClick={() => setShowBottomSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Monthly Bill</span>
                  <span className="text-right font-medium">£{breakdown.monthlyBill.toFixed(2)}</span>
                  
                  <span className="text-gray-500">Months Remaining</span>
                  <span className="text-right font-medium">{breakdown.monthsRemaining}</span>
                  
                  <span className="text-gray-500">Total (inc. VAT)</span>
                  <span className="text-right font-medium">£{breakdown.totalWithVAT.toFixed(2)}</span>
                  
                  <span className="text-gray-500">VAT Amount</span>
                  <span className="text-right font-medium">£{breakdown.vatAmount.toFixed(2)}</span>
                  
                  <span className="text-gray-500">Total (ex. VAT)</span>
                  <span className="text-right font-medium">£{breakdown.totalExVAT.toFixed(2)}</span>
                  
                  <span className="text-gray-500">Our Contribution</span>
                  <span className="text-right font-medium text-green-500">-£{breakdown.contribution.toFixed(2)}</span>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Final Payment</span>
                  <span className={`text-right font-bold ${canBuyoutInFull ? 'text-green-500' : 'text-yellow-500'}`}>
                    {canBuyoutInFull ? '£0.00' : `£${breakdown.customerPayment.toFixed(2)}`}
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    canBuyoutInFull 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}
                >
                  {canBuyoutInFull ? (
                    <div className="space-y-1">
                      <p className="text-green-500 font-medium flex items-center gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        Full buyout available
                      </p>
                      <p className="text-sm text-green-500/80">
                        We'll cover the entire cost of £{breakdown.totalExVAT.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-yellow-500 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Additional payment required
                      </p>
                      <p className="text-sm text-yellow-500/80">
                        Customer needs to pay: £{breakdown.customerPayment.toFixed(2)}
                      </p>
                    </div>
                  )}
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
