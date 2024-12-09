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
    painPoints,
    scheduledDate,
    togglePainPoint,
    setScheduledDate,
    submitAppointment,
    customerInfo,
    providerDetails
  } = useAppointmentStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    console.log('RevisitForm mounted');
    reset();
  }, [reset]);

  const handleNext = () => {
    console.log('Moving to next step:', step + 1);
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    console.log('Moving back, current step:', step);
    setError(null);
    if (step === 1) {
      navigate('/');
    } else {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      console.log('Submitting appointment...', { customerInfo, providerDetails, painPoints, scheduledDate });
      await new Promise(resolve => setTimeout(resolve, 500)); // Add small delay for better UX
      submitAppointment('revisit');
      console.log('Appointment submitted successfully');
      navigate('/');
    } catch (err) {
      console.error('Error submitting appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit appointment');
      setIsSubmitting(false);
      return; // Don't navigate on error
    }
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    console.log('Rendering step:', step);
    switch (step) {
      case 1:
        return <CustomerInfoForm />;
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
        console.warn('Invalid step:', step);
        return null;
    }
  };

  const stepTitles = [
    'Customer Information',
    'Current Provider Details'
  ];

  console.log('Current form state:', { step, error, isSubmitting });

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
          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 2 ? handleSubmit : handleNext}
            className={`px-6 py-2 bg-primary text-white rounded-md transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-hover'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Submitting...' 
              : step === 2 
                ? 'Submit' 
                : 'Continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisitForm;
