import React from 'react';
import Input from './ui/Input';
import Toggle from './ui/Toggle';
import { useAppointmentStore } from '../store/appointmentStore';

const CustomerInfoForm: React.FC = () => {
  const { customerInfo, setCustomerInfo } = useAppointmentStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Customer Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={customerInfo.firstName || ''}
          onChange={(e) => setCustomerInfo({ firstName: e.target.value })}
          placeholder="John"
        />
        <Input
          label="Last Name"
          value={customerInfo.lastName || ''}
          onChange={(e) => setCustomerInfo({ lastName: e.target.value })}
          placeholder="Doe"
        />
      </div>

      <div className="space-y-4">
        <Toggle
          label="Use email instead of phone"
          checked={customerInfo.contactType === 'email'}
          onChange={(checked) => 
            setCustomerInfo({ 
              contactType: checked ? 'email' : 'phone',
              contactValue: ''
            })
          }
        />

        <Input
          label={customerInfo.contactType === 'email' ? 'Email Address' : 'Phone Number'}
          type={customerInfo.contactType === 'email' ? 'email' : 'tel'}
          value={customerInfo.contactValue || ''}
          onChange={(e) => setCustomerInfo({ contactValue: e.target.value })}
          placeholder={customerInfo.contactType === 'email' ? 'john@example.com' : '07700 900000'}
        />
      </div>

      <div className="space-y-4">
        <Input
          label="Postcode"
          value={customerInfo.postcode || ''}
          onChange={(e) => setCustomerInfo({ postcode: e.target.value })}
          placeholder="SW1A 1AA"
        />
        <Input
          label="Address"
          value={customerInfo.address || ''}
          onChange={(e) => setCustomerInfo({ address: e.target.value })}
          placeholder="10 Downing Street"
        />
      </div>
    </div>
  );
};

export default CustomerInfoForm;