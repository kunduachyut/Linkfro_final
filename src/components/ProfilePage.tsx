import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import './ProfilePage.css';

// Type definitions
interface UserData {
  phoneNumber: string;
  companyWebsite: string;
  identity: string;
  paymentCountry: string;
  paymentMethod: string;
  paypalEmail: string;
}

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  managedBy?: string;
  placeholder?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

interface UserProfileSectionProps {
  user: any; // Clerk user object type can be more specific with @clerk/types
  joinDate: string;
}

interface BasicInformationSectionProps {
  user: any;
  userData: UserData;
  onInputChange: (field: keyof UserData, value: string) => void;
}

interface PaymentInformationSectionProps {
  userData: UserData;
  onInputChange: (field: keyof UserData, value: string) => void;
}

interface ActionButtonsProps {
  onSave: () => void;
}

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData>({
    phoneNumber: user?.primaryPhoneNumber?.phoneNumber || '+91',
    companyWebsite: '',
    identity: '',
    paymentCountry: '',
    paymentMethod: 'paypal',
    paypalEmail: ''
  });

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatJoinDate = (): string => {
    if (!user?.createdAt) return 'Joined on 01 August 2025';
    
    const joinDate = new Date(user.createdAt);
    return `Joined on ${joinDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })}`;
  };

  const handleSaveChanges = (): void => {
    // Handle save logic here
    console.log('Saving changes:', userData);
    // You can add API call here to save the data
  };

  if (!user) {
    return (
      <div className="loading">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <UserProfileSection 
        user={user}
        joinDate={formatJoinDate()}
      />

      <div className="info-sections">
        <BasicInformationSection 
          user={user}
          userData={userData}
          onInputChange={handleInputChange}
        />
        
        <PaymentInformationSection 
          userData={userData}
          onInputChange={handleInputChange}
        />
      </div>

      <ActionButtons onSave={handleSaveChanges} />
    </div>
  );
};

// Sub-components
const UserProfileSection: React.FC<UserProfileSectionProps> = ({ user, joinDate }) => (
  <div className="profile-section">
    <div className="user-info-card">
      <div className="user-avatar">
        <img 
          src={user.imageUrl} 
          alt={user.fullName || 'User'} 
          className="avatar-image"
        />
      </div>
      <div className="user-details">
        <h2>{user.fullName || 'Santanu Rakshit'}</h2>
        <p className="user-role">Publisher</p>
        <div className="status-balance">
          <div className="status">
            <span className="status-indicator"></span>
            Active Status
          </div>
          <div className="balance">
            <span className="balance-amount">$0</span>
            Balance
          </div>
        </div>
        <p className="join-date">{joinDate}</p>
      </div>
    </div>

    <button className="password-change-btn">
      Password Change
    </button>
  </div>
);

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ 
  user, 
  userData, 
  onInputChange 
}) => (
  <div className="info-section">
    <h3>Basic Information</h3>
    <div className="form-grid">
      <FormField 
        label="Name"
        type="text"
        value={user.fullName || 'Santanu Rakshit'}
        readOnly={true}
        managedBy="Clerk"
      />
      
      <FormField 
        label="Email Address"
        type="email"
        value={user.primaryEmailAddress?.emailAddress || 'santanu.digitalseo@gmail.com'}
        readOnly={true}
        managedBy="Clerk"
      />
      
      <FormField 
        label="Country"
        type="text"
        value="India"
        readOnly={true}
        managedBy="Clerk"
      />
      
      <FormField 
        label="Phone Number"
        type="text"
        value={userData.phoneNumber}
        onChange={(value: string) => onInputChange('phoneNumber', value)}
        placeholder="+91"
      />
      
      <FormField 
        label="Company Website"
        type="url"
        value={userData.companyWebsite}
        onChange={(value: string) => onInputChange('companyWebsite', value)}
        placeholder="https://"
      />
      
      <SelectField 
        label="Identity"
        value={userData.identity}
        onChange={(value: string) => onInputChange('identity', value)}
        options={[
          { value: '', label: 'Select Identity' },
          { value: 'individual', label: 'Individual' },
          { value: 'company', label: 'Company' },
          { value: 'agency', label: 'Agency' }
        ]}
      />
    </div>
  </div>
);

const PaymentInformationSection: React.FC<PaymentInformationSectionProps> = ({ 
  userData, 
  onInputChange 
}) => (
  <div className="info-section">
    <h3>Payment Information</h3>
    <div className="form-grid">
      <SelectField 
        label="Payment Country"
        value={userData.paymentCountry}
        onChange={(value: string) => onInputChange('paymentCountry', value)}
        options={[
          { value: '', label: 'Select Country' },
          { value: 'india', label: 'India' },
          { value: 'usa', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'canada', label: 'Canada' }
        ]}
      />
      
      <SelectField 
        label="Preferred Method"
        value={userData.paymentMethod}
        onChange={(value: string) => onInputChange('paymentMethod', value)}
        options={[
          { value: 'paypal', label: 'PayPal' },
          { value: 'bank', label: 'Bank Transfer' },
          { value: 'stripe', label: 'Stripe' },
          { value: 'wise', label: 'Wise' }
        ]}
      />
      
      <FormField 
        label="Paypal Email"
        type="email"
        value={userData.paypalEmail}
        onChange={(value: string) => onInputChange('paypalEmail', value)}
        placeholder="Enter PayPal email"
      />
    </div>
  </div>
);

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  type, 
  value, 
  onChange, 
  readOnly = false, 
  managedBy, 
  placeholder 
}) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(e.target.value)}
      readOnly={readOnly}
      className={`form-input ${readOnly ? 'readonly' : ''}`}
      placeholder={placeholder}
    />
    {managedBy && <span className="readonly-note">Managed by {managedBy}</span>}
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <div className="form-group">
    <label>{label}</label>
    <select
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className="form-select"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ActionButtons: React.FC<ActionButtonsProps> = ({ onSave }) => (
  <div className="action-buttons">
    <button className="edit-btn" onClick={onSave}>
      Save Changes
    </button>
  </div>
);

export default ProfilePage;