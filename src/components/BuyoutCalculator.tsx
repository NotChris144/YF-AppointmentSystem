import React, { useState } from 'react';
import { AlertTriangle, Wifi } from 'lucide-react';
import useDevice from '../hooks/useDevice';

interface SpeedTestData {
  download: number;
  upload: number;
}

const BuyoutCalculator: React.FC = () => {
  const { isMobile, isTablet } = useDevice();
  const [provider, setProvider] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
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

  const calculateBuyout = () => {
    const monthlyAmount = parseFloat(monthlyBill) || 0;
    const months = calculateMonthsRemaining();
    const totalCost = monthlyAmount * months;
    const costExVAT = totalCost / (1 + VAT_RATE);
    const amountToPay = Math.max(0, costExVAT - BUYOUT_CONTRIBUTION);
    
    return {
      totalCost: costExVAT,
      amountToPay,
      canBuyoutInFull: costExVAT <= BUYOUT_CONTRIBUTION
    };
  };

  const hasSpeedDifference = () => {
    return actualSpeed.download > 0 && 
           Math.abs(estimatedSpeed - actualSpeed.download) / estimatedSpeed > 0.2;
  };

  const { totalCost, amountToPay, canBuyoutInFull } = calculateBuyout();

  return (
    <div className={`space-y-6 ${isMobile ? 'text-sm' : 'text-base'}`}>
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Current Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={`w-full ${
              isMobile ? 'p-2 text-base' : 'p-3'
            } rounded-md border border-input bg-background`}
          >
            <option value="">Select Provider</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Monthly Cost (£)</label>
          <input
            type="number"
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(e.target.value)}
            className={`w-full ${
              isMobile ? 'p-2 text-base' : 'p-3'
            } rounded-md border border-input bg-background`}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Estimated Speed (Mbps)
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1000"
              value={estimatedSpeed}
              onChange={(e) => setEstimatedSpeed(parseInt(e.target.value))}
              className="w-full"
            />
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              <input
                type="number"
                value={estimatedSpeed}
                onChange={(e) => setEstimatedSpeed(parseInt(e.target.value) || 0)}
                className={`w-full ${
                  isMobile ? 'p-2 text-base' : 'p-3'
                } rounded-md border border-input bg-background`}
                placeholder="Enter speed"
              />
              <p className="text-right self-center text-gray-400">
                {estimatedSpeed} Mbps
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSpeedTest(!showSpeedTest)}
          className={`w-full ${
            isMobile ? 'p-2 text-sm' : 'p-3'
          } bg-primary/10 hover:bg-primary/20 text-primary rounded-md flex items-center justify-center gap-2`}
        >
          <Wifi className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          Speed Test Benchmark
        </button>

        {showSpeedTest && (
          <div className={`space-y-4 ${
            isMobile ? 'p-3' : 'p-4'
          } bg-card/50 rounded-md`}>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block font-medium mb-1">Download Speed (Mbps)</label>
                <input
                  type="number"
                  value={actualSpeed.download}
                  onChange={(e) => setActualSpeed({ ...actualSpeed, download: parseFloat(e.target.value) || 0 })}
                  className={`w-full ${
                    isMobile ? 'p-2 text-base' : 'p-3'
                  } rounded-md border border-input bg-background`}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Upload Speed (Mbps)</label>
                <input
                  type="number"
                  value={actualSpeed.upload}
                  onChange={(e) => setActualSpeed({ ...actualSpeed, upload: parseFloat(e.target.value) || 0 })}
                  className={`w-full ${
                    isMobile ? 'p-2 text-base' : 'p-3'
                  } rounded-md border border-input bg-background`}
                />
              </div>
            </div>
          </div>
        )}

        {hasSpeedDifference() && (
          <div className={`${
            isMobile ? 'p-3 text-sm' : 'p-4'
          } bg-yellow-500/10 border border-yellow-500/20 rounded-md flex gap-2`}>
            <AlertTriangle className={`${
              isMobile ? 'w-4 h-4' : 'w-5 h-5'
            } text-yellow-500 flex-shrink-0`} />
            <p className="text-yellow-500">
              Significant speed difference detected. Your actual speed is {Math.abs(Math.round((estimatedSpeed - actualSpeed.download) / estimatedSpeed * 100))}% different from the expected speed.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <label className="block font-medium">Contract End Date</label>
          <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-between' : ''}`}>
            {presetPeriods.map(period => (
              <button
                key={period.value}
                onClick={() => {
                  setContractEndType('preset');
                  setContractLength(period.value);
                }}
                className={`${
                  isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
                } rounded-md transition-colors ${
                  contractEndType === 'preset' && contractLength === period.value
                    ? 'bg-primary text-white'
                    : 'bg-card hover:bg-primary/10'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setContractEndType('custom');
                setCustomDate(e.target.value);
              }}
              className={`flex-1 ${
                isMobile ? 'p-2 text-sm' : 'p-3'
              } rounded-md border border-input bg-background`}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <div className={`space-y-4 ${
        isMobile ? 'p-4' : 'p-6'
      } bg-card/50 rounded-lg`}>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
          <div>
            <p className="text-gray-400">Months Remaining</p>
            <p className={`${
              isMobile ? 'text-lg' : 'text-xl'
            } font-semibold`}>{calculateMonthsRemaining()}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Cost (ex. VAT)</p>
            <p className={`${
              isMobile ? 'text-lg' : 'text-xl'
            } font-semibold`}>£{totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className={`${
          isMobile ? 'p-3' : 'p-4'
        } rounded-md ${
          canBuyoutInFull 
            ? 'bg-green-500/10 border border-green-500/20' 
            : 'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          {canBuyoutInFull ? (
            <p className="text-green-500 font-medium">
              ✓ Full buyout available - We'll cover the entire cost
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-yellow-500 font-medium">
                Additional payment required
              </p>
              <p className={`${
                isMobile ? 'text-sm' : 'text-base'
              } text-yellow-500/80`}>
                Customer needs to pay: £{amountToPay.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyoutCalculator;
