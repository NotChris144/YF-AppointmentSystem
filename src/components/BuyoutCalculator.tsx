import React, { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, X, ArrowRight } from 'lucide-react';
import useDevice from '../hooks/useDevice';
import { motion, AnimatePresence } from 'framer-motion';
import NumberPad from './ui/NumberPad';
import { cn } from '../lib/utils';
import { usePriceStore } from '../store/priceStore';
import { Link } from 'react-router-dom';

interface BuyoutBreakdown {
  monthlyBill: number;
  monthsRemaining: number;
  totalCost: number;
  totalExVAT: number;
  vatAmount: number;
  contribution: number;
  customerPayment: number;
}

const BuyoutCalculator: React.FC = () => {
  const { isMobile } = useDevice();
  const [provider, setProvider] = useState('');
  const { monthlyPrice: monthlyBill, setMonthlyPrice: setMonthlyBill } = usePriceStore();
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [contractEndType, setContractEndType] = useState<'preset' | 'custom' | null>(null);
  const [contractLength, setContractLength] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const BUYOUT_CONTRIBUTION = 300; // £300 contribution
  const VAT_RATE = 0.20; // 20% VAT
  const removeVAT = (amount: number) => amount / (1 + VAT_RATE);
  const addVAT = (amount: number) => amount * (1 + VAT_RATE);

  const providers = ['BT', 'Sky', 'TalkTalk', 'Virgin Media', 'Vodafone', 'Now', 'Plusnet', 'EE', 'Other'];
  const presetPeriods = [
    { label: isMobile ? '6M' : '6 Months', value: '6' },
    { label: isMobile ? '12M' : '12 Months', value: '12' },
    { label: isMobile ? '18M' : '18 Months', value: '18' },
    { label: isMobile ? '24M' : '24 Months', value: '24' }
  ];

  const areInputsComplete = () => {
    return monthlyBill && provider && (contractLength || customDate);
  };

  const handleBillChange = (value: string) => {
    setMonthlyBill(value);
  };

  const handleBillSubmit = (value: string) => {
    setMonthlyBill(value);
    setIsEditingBill(false);
  };

  const handleProviderClick = (selectedProvider: string) => {
    if (provider === selectedProvider) {
      setProvider('');
    } else {
      setProvider(selectedProvider);
    }
  };

  const handlePresetPeriodClick = (value: string) => {
    if (contractLength === value && contractEndType === 'preset') {
      setContractLength(null);
      setContractEndType(null);
    } else {
      setContractLength(value);
      setContractEndType('preset');
      // Update custom date to reflect the selected period
      const date = new Date();
      date.setMonth(date.getMonth() + parseInt(value));
      setCustomDate(date.toISOString().split('T')[0]);
      
      // Set showBreakdown first
      setShowBreakdown(true);
      
      // Wait for the breakdown section to be rendered
      setTimeout(() => {
        const breakdownSection = document.getElementById('breakdown-section');
        if (breakdownSection) {
          breakdownSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200); // Increased timeout to ensure rendering is complete
    }
  };

  const handleContractLengthChange = (value: string) => {
    setContractLength(value);
    // Scroll to breakdown section
    const breakdownSection = document.getElementById('breakdown-section');
    if (breakdownSection) {
      setTimeout(() => {
        breakdownSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleCustomDateChange = (date: string) => {
    setCustomDate(date);
    setContractEndType('custom');
    const months = calculateMonthsFromDate(date);
    setContractLength(months.toString());
    
    // Set showBreakdown first
    setShowBreakdown(true);
    
    // Wait for the breakdown section to be rendered
    setTimeout(() => {
      const breakdownSection = document.getElementById('breakdown-section');
      if (breakdownSection) {
        breakdownSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200); // Increased timeout to ensure rendering is complete
  };

  const startBreakdownAnimation = () => {
    setShowBreakdown(true);
    setAnimationStep(0);
    
    // Create ref for breakdown section if not already created
    const breakdownSection = document.getElementById('breakdown-section');
    if (breakdownSection) {
      // Removed auto-scrolling
    }
    
    const timer = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= 8) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
  };

  useEffect(() => {
    if (contractLength && provider && monthlyBill) {
      setShowBreakdown(true);
      startBreakdownAnimation();
    } else {
      hideBreakdown();
    }
  }, [contractLength, provider, monthlyBill]);

  const calculateMonthsRemaining = () => {
    if (!contractEndType) return 0;
    if (contractEndType === 'preset') {
      return parseInt(contractLength || '0');
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
    const totalCost = monthlyAmount * months;
    let buyoutAmount = 0;

    switch (provider.toUpperCase()) {
      case 'SKY': {
        const monthlyCostAfterVAT = monthlyAmount * (1 - VAT_RATE);
        const savingsCost = monthlyCostAfterVAT * 0.59;
        const adjustedMonthlyCost = (monthlyCostAfterVAT - savingsCost) * months;
        buyoutAmount = adjustedMonthlyCost * 1.81;
        break;
      }
      case 'VODAFONE': {
        const totalCost = monthlyAmount * months;
        const totalCostAfterVAT = totalCost * (1 - VAT_RATE);
        const savingsCost = 14 * months;
        const earlyPaymentDiscount = (totalCostAfterVAT - savingsCost) * 0.01;
        buyoutAmount = (totalCostAfterVAT - savingsCost - earlyPaymentDiscount) * (1 + VAT_RATE);
        break;
      }
      case 'EE': {
        // Step 1: Deduct VAT from the monthly cost (after applying the monthly discount)
        const monthlyCostAfterDiscount = monthlyAmount - 11;
        const monthlyCostAfterVAT = monthlyCostAfterDiscount * (1 - VAT_RATE);
        
        // Step 2: Deduct the costs saved (62% of monthlyCostAfterVAT)
        const savingsCost = monthlyCostAfterVAT * 0.62;
        let adjustedMonthlyCost = monthlyCostAfterVAT - savingsCost;
        
        // Check if adjustedMonthlyCost is negative, and set it to 0 if it is
        adjustedMonthlyCost = Math.max(0, adjustedMonthlyCost);
        
        // Step 3: Deduct 4% for early receipt
        const adjustedMonthlyCostAfterDiscount = adjustedMonthlyCost * (1 - 0.04);
        
        // Step 4: Multiply by the remaining months
        const totalCost = adjustedMonthlyCostAfterDiscount * months;
        
        // Step 5: Add VAT to get the Early Cancellation Charge
        buyoutAmount = totalCost * (1 + VAT_RATE);
        break;
      }
      case 'PLUSNET': {
        const monthlyCostAfterVAT = monthlyAmount * (1 - VAT_RATE);
        const savingsCostPerMonth = 12;  // savings cost per month
        const adjustedMonthlyCost = monthlyCostAfterVAT - savingsCostPerMonth;
        const earlyRepaymentDiscount = adjustedMonthlyCost * 0.99;  // deducting 1% for early repayment
        const fullMonthsCharge = earlyRepaymentDiscount * months;
        const daysInMonth = 30;  // assuming all months have 30 days for simplicity
        const remainingDaysCharge = (earlyRepaymentDiscount / daysInMonth) * 20;  // 20 remaining days
        const totalEtcBeforeVat = fullMonthsCharge + remainingDaysCharge;
        buyoutAmount = totalEtcBeforeVat * (1 + VAT_RATE);  // adding VAT back
        break;
      }
      case 'BT': {
        const totalCost = monthlyAmount * months;
        const totalCostAfterVAT = totalCost * (1 - VAT_RATE);
        const savingsCost = 15 * months;
        const earlyPaymentDiscount = (totalCostAfterVAT - savingsCost) * 0.01;
        buyoutAmount = (totalCostAfterVAT - savingsCost - earlyPaymentDiscount) * (1 + VAT_RATE);
        break;
      }
      case 'NOW': {
        const monthlyCostAfterVAT = monthlyAmount * (1 - VAT_RATE);
        const businessCostAndDiscount = (monthlyCostAfterVAT * 0.42) * months;
        buyoutAmount = businessCostAndDiscount;
        break;
      }
      case 'VIRGIN MEDIA': {
        const etfPercentage = 0.90;
        buyoutAmount = monthlyAmount * months * etfPercentage;
        break;
      }
      default: {
        // Default calculation for other providers
        const monthlyCostAfterVAT = monthlyAmount * (1 - VAT_RATE);
        const savingsCost = monthlyCostAfterVAT * 0.75;  // Using 0.75 as the average percentage difference
        const adjustedMonthlyCost = monthlyCostAfterVAT - savingsCost;
        const earlyRepaymentDiscount = adjustedMonthlyCost * 0.01;  // 1% discount for early repayment
        const totalCostBeforeVAT = (adjustedMonthlyCost - earlyRepaymentDiscount) * months;
        buyoutAmount = totalCostBeforeVAT * (1 + VAT_RATE);
      }
    }

    const customerPayment = Math.max(0, buyoutAmount - BUYOUT_CONTRIBUTION);
    
    return {
      monthlyBill: monthlyAmount,
      monthsRemaining: months,
      totalCost,
      totalExVAT: buyoutAmount,
      vatAmount: totalCost - buyoutAmount,
      contribution: Math.min(BUYOUT_CONTRIBUTION, buyoutAmount),
      customerPayment
    };
  };

  const breakdown = calculateBreakdown();
  const canBuyoutInFull = breakdown.customerPayment === 0;

  const handleConfirmBill = (value: string) => {
    setMonthlyBill(value);
    setIsEditingBill(false);
  };

  const handleEditBill = () => {
    setIsEditingBill(true);
    setShowBreakdown(false);
  };

  const handleClearBill = () => {
    setMonthlyBill('');
    setIsEditingBill(false);
    setShowBreakdown(false);
  };

  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (canBuyoutInFull && showBreakdown) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 5000); // Hide particles after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setShowParticles(false);
    }
  }, [canBuyoutInFull, showBreakdown]);

  const hideBreakdown = () => {
    setShowBreakdown(false);
    setAnimationStep(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      {/* Monthly Bill Input */}
      <div className="relative">
        <AnimatePresence>
          {isEditingBill && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setIsEditingBill(false)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 shadow-2xl"
              >
                <div className="flex justify-between items-center p-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold">Enter Monthly Bill</h3>
                  <button
                    onClick={() => setIsEditingBill(false)}
                    className="p-2 hover:bg-card/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <NumberPad
                  value={monthlyBill || ''}
                  onChange={handleBillChange}
                  maxValue={999.99}
                  minValue={0}
                  prefix="£"
                  onConfirm={handleBillSubmit}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div
          onClick={() => setIsEditingBill(true)}
          className={cn(
            "w-full p-4 rounded-lg bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors",
            "flex items-center justify-between"
          )}
        >
          <div>
            <label className="text-sm text-gray-400">Monthly Bill</label>
            <div className="text-2xl font-bold">
              £{monthlyBill ? parseFloat(monthlyBill).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>
          <Edit2 className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Provider Selection */}
      <motion.div
        className="space-y-4 rounded-xl bg-card/50 p-4 sm:p-6"
        animate={{ opacity: 1 }}
      >
        <h3 className="text-lg font-medium">Who's your provider?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {providers.map(p => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(p)}
              className={`p-4 rounded-xl border-2 transition-all ${
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

      {/* Contract Length Section */}
      <motion.div
        className="rounded-xl bg-card/50 p-4 sm:p-6 space-y-4"
        animate={{ opacity: monthlyBill ? 1 : 0.8 }}
      >
        <h3 className="text-lg font-medium">Contract Length</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presetPeriods.map(period => (
            <motion.button
              key={period.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePresetPeriodClick(period.value)}
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
            onChange={(e) => handleCustomDateChange(e.target.value)}
            className={`w-full p-4 rounded-lg bg-transparent border transition-all ${
              contractEndType === 'custom'
                ? 'border-primary bg-primary/5'
                : 'border-border/50'
            } focus:border-primary focus:ring-0 text-base`}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            id="breakdown-section"
            className={`relative p-4 sm:p-6 rounded-xl border-2 space-y-4 overflow-hidden ${
              canBuyoutInFull 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-yellow-500/5 border-yellow-500/20'
            }`}
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between relative z-10"
            >
              <h3 className="text-lg font-medium">Breakdown</h3>
            </motion.div>

            <div className="space-y-4 overflow-hidden relative z-10">
              <div className="grid gap-3">
                {[
                  {
                    label: "Monthly Bill",
                    value: `£${breakdown.monthlyBill.toFixed(2)}`,
                    step: 0
                  },
                  {
                    label: "Months Remaining",
                    value: breakdown.monthsRemaining,
                    step: 1
                  },
                  {
                    label: "Total Cost",
                    value: `£${breakdown.totalCost.toFixed(2)}`,
                    step: 2
                  },
                  {
                    label: "Total Cost - VAT",
                    value: `£${breakdown.totalExVAT.toFixed(2)}`,
                    step: 3
                  },
                  {
                    label: "VAT Amount",
                    value: `£${breakdown.vatAmount.toFixed(2)}`,
                    step: 4
                  },
                  {
                    label: "Our Contribution",
                    value: `-£${breakdown.contribution.toFixed(2)}`,
                    isGreen: true,
                    step: 5
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex justify-between items-center p-4 rounded-lg bg-black/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: animationStep >= item.step ? 1 : 0,
                      x: animationStep >= item.step ? 0 : -20
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-medium ${item.isGreen ? 'text-green-500' : ''}`}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="pt-6"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: animationStep >= 6 ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <span className="text-lg font-medium mb-2 block">Final Payment</span>
                  <span className={`text-3xl font-bold block mb-3 ${canBuyoutInFull ? 'text-green-500' : 'text-yellow-500'}`}>
                    £{breakdown.customerPayment.toFixed(2)}
                  </span>
                  <motion.p
                    className={`text-sm ${canBuyoutInFull ? 'text-green-600/80' : 'text-yellow-600/80'}`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: animationStep >= 7 ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {canBuyoutInFull 
                      ? 'Great news! We\'ll cover your entire buyout cost.'
                      : 'Additional payment needed to complete your buyout.'}
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: animationStep >= 8 ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  to="/price-comparison"
                  className={cn(
                    "inline-block mt-4 px-4 py-2 rounded-lg",
                    "bg-primary/10 border border-primary/20",
                    "hover:bg-primary/20 hover:border-primary/30",
                    "text-primary text-sm font-medium",
                    "transition-all duration-200"
                  )}
                >
                  View Our Packages
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyoutCalculator;
