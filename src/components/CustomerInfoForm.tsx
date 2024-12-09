import React from 'react';
import Input from './ui/Input';
import Toggle from './ui/Toggle';
import { useAppointmentStore } from '../store/appointmentStore';

const CustomerInfoForm: React.FC = () => {
  const { customerInfo, setCustomerInfo } = useAppointmentStore();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // UK phone number format
    const phoneRegex = /^0[0-9]{3,4}\s?[0-9]{3}\s?[0-9]{3,4}$/;
    return phoneRegex.test(phone);
  };

  const validatePostcode = (postcode: string) => {
    // UK postcode format
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
  };

  const handleContactValueChange = (value: string) => {
    setCustomerInfo({ contactValue: value });
    if (value) {
      if (customerInfo.contactType === 'email' && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, contact: 'Please enter a valid email address' }));
      } else if (customerInfo.contactType === 'phone' && !validatePhone(value)) {
        setErrors(prev => ({ ...prev, contact: 'Please enter a valid UK phone number' }));
      } else {
        setErrors(prev => ({ ...prev, contact: '' }));
      }
    } else {
      setErrors(prev => ({ ...prev, contact: '' }));
    }
  };

  const handlePostcodeChange = (value: string) => {
    // Convert to uppercase
    const formattedValue = value.toUpperCase();
    setCustomerInfo({ postcode: formattedValue });
    
    if (formattedValue && !validatePostcode(formattedValue)) {
      setErrors(prev => ({ ...prev, postcode: 'Please enter a valid UK postcode' }));
    } else {
      setErrors(prev => ({ ...prev, postcode: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={customerInfo.firstName || ''}
          onChange={(e) => setCustomerInfo({ firstName: e.target.value })}
          placeholder="John"
          required
        />
        <Input
          label="Last Name"
          value={customerInfo.lastName || ''}
          onChange={(e) => setCustomerInfo({ lastName: e.target.value })}
          placeholder="Doe"
          required
        />
      </div>

      <div className="space-y-4">
        <Toggle
          label="Use email instead of phone"
          checked={customerInfo.contactType === 'email'}
          onChange={(checked) => {
            setCustomerInfo({ 
              contactType: checked ? 'email' : 'phone',
              contactValue: ''
            });
            setErrors(prev => ({ ...prev, contact: '' }));
          }}
        />

        <Input
          label={customerInfo.contactType === 'email' ? 'Email Address' : 'Phone Number'}
          type={customerInfo.contactType === 'email' ? 'email' : 'tel'}
          value={customerInfo.contactValue || ''}
          onChange={(e) => handleContactValueChange(e.target.value)}
          placeholder={customerInfo.contactType === 'email' ? 'john@example.com' : '07700 900 000'}
          error={errors.contact}
          helper={customerInfo.contactType === 'phone' ? 'Format: 07700 900 000' : undefined}
          required
        />
      </div>

      <div className="space-y-4">
        <Input
          label="Postcode"
          value={customerInfo.postcode || ''}
          onChange={(e) => handlePostcodeChange(e.target.value)}
          placeholder="SW1A 1AA"
          error={errors.postcode}
          helper="Format: SW1A 1AA"
          required
        />
      </div>
    </div>
  );
};

export default CustomerInfoForm;