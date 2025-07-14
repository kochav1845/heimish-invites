import React from 'react';
import { UserInfo } from '../../types/customization';

interface UserInfoFormProps {
  userInfo: UserInfo;
  onChange: (field: keyof UserInfo, value: string) => void;
  error?: string | null;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ userInfo, onChange, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">Welcome!</h3>
          <p className="text-gray-400">Let's get to know you better.</p>
        </div>
        
        <div className="space-y-6 bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <div>
            <label className="block text-sm font-medium text-white mb-2">What's your name?</label>
            <div className="relative">
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Your email address</label>
            <div className="relative">
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Your phone number</label>
            <div className="relative">
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Project type</label>
            <div className="relative">
              <select
                value={userInfo.projectType}
                onChange={(e) => onChange('projectType', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select project type</option>
                <option value="website">Website</option>
                <option value="web-application">Web Application</option>
                <option value="e-commerce">E-commerce</option>
                <option value="mobile-app">Mobile App</option>
                <option value="custom-software">Custom Software</option>
                <option value="ai-integration">AI Integration</option>
                <option value="automation">Business Automation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Budget range</label>
            <div className="relative">
              <select
                value={userInfo.budget}
                onChange={(e) => onChange('budget', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select budget range</option>
                <option value="under-5k">Under $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-50k">$25,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="over-100k">Over $100,000</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;