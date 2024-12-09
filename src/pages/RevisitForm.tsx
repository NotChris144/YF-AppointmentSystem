import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfoForm from '../components/CustomerInfoForm';
import ProviderDetailsForm from '../components/ProviderDetailsForm';
import PainPoints from '../components/PainPoints';
import SaleTemperature from '../components/SaleTemperature';
import DateTimePicker from '../components/ui/DateTimePicker';
import { useAppointmentStore } from '../store/appointmentStore';

const RevisitForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    reset, 
    customerInfo,
    painPoints,
    scheduledDate,
    togglePainPoint,
    setScheduledDate,
    submitAppointment
  } = useAppointmentStore();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');

  React.useEffect(() => {
    reset();
  }, [reset]);

  const validateCustomerInfo = () => {
    if (!customerInfo.firstName) {
      setValidationError('Please enter first name');
      return false;
    }
    if (!customerInfo.lastName) {
      setValidationError('Please enter last name');
      return false;
    }
    if (!customerInfo.contactValue) {
      setValidationError(`Please enter ${customerInfo.contactType === 'email' ? 'email' : 'phone number'}`);
      return false;
    }
    if (!customerInfo.postcode) {
      setValidationError('Please enter postcode');
      return false;
    }
    if (!customerInfo.address) {
      setValidationError('Please enter address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateCustomerInfo()) {
      return;
    }
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
    submitAppointment('revisit');
    navigate('/');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CustomerInfoForm />
            {validationError && (
              <div className="text-error text-sm mt-4 text-center">
                {validationError}
              </div>
            )}
          </>
        );
      case 2:
        return (
          <div className="space-y-8">
            <ProviderDetailsForm />
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

  const stepTitles = [
    'Customer Information',
    'Current Provider Details'
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
            onClick={step === 2 ? handleSubmit : handleNext}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            {step === 2 ? 'Submit' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisitForm;
