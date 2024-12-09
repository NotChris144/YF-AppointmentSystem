import React from 'react';
import { cn } from '../lib/utils';
import Input from './ui/Input';
import Select from './ui/Select';
import Toggle from './ui/Toggle';
import ContractEndSelect from './ui/ContractEndSelect';
import ContractBuyout from './ui/ContractBuyout';
import SpeedVerification from './SpeedVerification';
import TVPackageSelection from './TVPackageSelection';
import { useAppointmentStore } from '../store/appointmentStore';
import { tvPackages } from '../data/tvPackages';
import type { TVPackage } from '../types/appointment';

const providers = [
  { value: 'bt', label: 'BT' },
  { value: 'sky', label: 'Sky' },
  { value: 'virgin', label: 'Virgin Media' },
  { value: 'talktalk', label: 'TalkTalk' },
  { value: 'vodafone', label: 'Vodafone' },
  { value: 'other', label: 'Other' },
];

const ProviderDetailsForm: React.FC = () => {
  const { providerDetails, setProviderDetails } = useAppointmentStore();
  const [showCustomProvider, setShowCustomProvider] = React.useState(false);
  const [isSpeedCorrect, setIsSpeedCorrect] = React.useState<boolean | null>(null);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowCustomProvider(value === 'other');
    setProviderDetails({ name: value === 'other' ? '' : value });
  };

  const handleSpeedChange = (speed: number) => {
    setProviderDetails({ speed });
    setIsSpeedCorrect(null);
  };

  const handleActualSpeedChange = (speed: number) => {
    setProviderDetails({ 
      estimatedSpeed: speed
    });
  };

  const handleTVPackageToggle = (pkg: TVPackage) => {
    const currentPackages = providerDetails.products?.tvPackages || [];
    const newPackages = currentPackages.some(p => p.id === pkg.id)
      ? currentPackages.filter(p => p.id !== pkg.id)
      : [...currentPackages, pkg];
    
    setProviderDetails({
      products: {
        ...providerDetails.products,
        tvPackages: newPackages,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Current Provider Details</h2>

      <div className="space-y-4">
        <Select
          label="Current Provider"
          value={providerDetails.name || ''}
          onChange={handleProviderChange}
          options={providers}
          required={false}
        />

        {showCustomProvider && (
          <Input
            label="Provider Name"
            value={providerDetails.name || ''}
            onChange={(e) => setProviderDetails({ name: e.target.value })}
            placeholder="Enter provider name"
          />
        )}

        <Input
          label="Monthly Cost"
          type="number"
          value={providerDetails.price || ''}
          onChange={(e) => setProviderDetails({ price: parseFloat(e.target.value) || 0 })}
          placeholder="29.99"
          min="0"
          step="0.01"
        />

        <SpeedVerification
          estimatedSpeed={providerDetails.speed || 0}
          actualSpeed={providerDetails.estimatedSpeed || null}
          onEstimatedSpeedChange={handleSpeedChange}
          onActualSpeedChange={handleActualSpeedChange}
          isCorrect={isSpeedCorrect}
          onIsCorrectChange={setIsSpeedCorrect}
          required={false}
        />

        <ContractEndSelect
          value={providerDetails.contractEnd || null}
          onChange={(date) => setProviderDetails({ contractEnd: date })}
          required={false}
        />

        <ContractBuyout
          monthlyPrice={providerDetails.price}
          contractEnd={providerDetails.contractEnd}
        />

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Additional Products</h3>
          
          <Toggle
            label="TV Package"
            checked={providerDetails.products?.tv || false}
            onChange={(checked) => 
              setProviderDetails({ 
                products: { 
                  ...providerDetails.products,
                  tv: checked,
                  tvPackages: checked ? providerDetails.products?.tvPackages || [] : [],
                } 
              })
            }
          />

          {providerDetails.products?.tv && (
            <div className="space-y-4 pl-8">
              <TVPackageSelection
                packages={tvPackages}
                selectedPackages={providerDetails.products?.tvPackages || []}
                onToggle={handleTVPackageToggle}
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-200">Do they use these services?</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => 
                      setProviderDetails({
                        products: {
                          ...providerDetails.products,
                          usesServices: true,
                        },
                      })
                    }
                    className={cn(
                      "px-3 py-1 rounded-md text-sm",
                      providerDetails.products?.usesServices === true
                        ? "bg-success text-white"
                        : "bg-background text-gray-400 hover:text-white"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => 
                      setProviderDetails({
                        products: {
                          ...providerDetails.products,
                          usesServices: false,
                        },
                      })
                    }
                    className={cn(
                      "px-3 py-1 rounded-md text-sm",
                      providerDetails.products?.usesServices === false
                        ? "bg-error text-white"
                        : "bg-background text-gray-400 hover:text-white"
                    )}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          <Toggle
            label="Mobile Service"
            checked={providerDetails.products?.mobile || false}
            onChange={(checked) => 
              setProviderDetails({ 
                products: { 
                  ...providerDetails.products,
                  mobile: checked 
                } 
              })
            }
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Landline Service
            </label>
            <Select
              value={providerDetails.products?.landline || 'none'}
              onChange={(e) => 
                setProviderDetails({ 
                  products: { 
                    ...providerDetails.products,
                    landline: e.target.value as 'none' | 'incoming' | 'outgoing' | 'both'
                  } 
                })
              }
              options={[
                { value: 'none', label: 'No Landline' },
                { value: 'incoming', label: 'Incoming Only' },
                { value: 'outgoing', label: 'Outgoing Only' },
                { value: 'both', label: 'Incoming & Outgoing' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsForm;