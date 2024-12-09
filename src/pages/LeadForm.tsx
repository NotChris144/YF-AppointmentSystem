import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoForm from '../components/CustomerInfoForm';
import ProviderDetailsForm from '../components/ProviderDetailsForm';
import PackageSelection from '../components/PackageSelection';
import AddonSelection from '../components/AddonSelection';
import PainPoints from '../components/PainPoints';
import SaleTemperature from '../components/SaleTemperature';
import DateTimePicker from '../components/ui/DateTimePicker';
import { useAppointmentStore } from '../store/appointmentStore';
import { packages } from '../data/packages';
import { addons } from '../data/addons';

const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    reset, 
    selectedPackage, 
    selectedAddons, 
    painPoints, 
    scheduledDate,
    setSelectedPackage, 
    toggleAddon, 
    togglePainPoint,
    setScheduledDate,
    submitAppointment
  } = useAppointmentStore();
  const [step, setStep] = useState(1);

  React.useEffect(() => {
    reset();
  }, [reset]);

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    submitAppointment('lead');
    navigate('/');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <CustomerInfoForm />;
      case 2:
        return <ProviderDetailsForm />;
      case 3:
        return (
          <div className="space-y-8">
            <PackageSelection
              packages={packages}
              selectedPackage={selectedPackage}
              onSelect={setSelectedPackage}
            />
            {selectedPackage && (
              <div className="animate-in fade-in slide-in-from-bottom duration-300">
                <AddonSelection
                  addons={addons}
                  selectedPackage={selectedPackage}
                  selectedAddons={selectedAddons}
                  onToggle={toggleAddon}
                />
              </div>
            )}
            <PainPoints
              selectedPoints={painPoints}
              onToggle={togglePainPoint}
            />
            <DateTimePicker
              value={scheduledDate}
              onChange={setScheduledDate}
            />
            <SaleTemperature />
          </div>
        );
      default:
        return null;
    }
  };

  const isLastStep = step === 3;
  const stepTitles = [
    'Customer Information',
    'Current Provider Details',
    'Package Selection'
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {stepTitles.map((title, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index + 1 === step
                        ? 'bg-primary text-white'
                        : index + 1 < step
                        ? 'bg-success text-white'
                        : 'bg-card text-gray-400'
                    }`}
                  >
                    {index + 1 < step ? '✓' : index + 1}
                  </div>
                  <span
                    className={`ml-2 ${
                      index + 1 === step ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {title}
                  </span>
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index + 1 < step ? 'bg-success' : 'bg-card'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
          {renderStepContent()}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={isLastStep ? handleSubmit : handleNext}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            {isLastStep ? 'Submit' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;