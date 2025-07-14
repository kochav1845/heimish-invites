import React from 'react';
import { Wand2 } from 'lucide-react';
import { CustomizationOptions } from '../../types/customization';

interface CompanyInfoFormProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
  isGenerating: boolean;
  onGenerateContent: (type: 'tagline' | 'description') => void;
  error?: string | null;
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({
  options,
  onOptionsChange,
  isGenerating,
  onGenerateContent,
  error
}) => {
  return (
    <div className="max-w-md w-full space-y-6">
      <h3 className="text-2xl font-semibold text-white text-center mb-6">Company Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-white mb-2">Company Name</label>
        <div className="relative">
          <input
            type="text"
            value={options.companyName}
            onChange={(e) => onOptionsChange({
              ...options,
              companyName: e.target.value
            })}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tagline
          <button
            onClick={() => onGenerateContent('tagline')}
            disabled={isGenerating}
            className="ml-2 text-purple-400 hover:text-purple-300 disabled:text-gray-500"
          >
            <Wand2 className="w-4 h-4 inline-block" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </label>
        <div className="relative">
          <input
            type="text"
            value={options.companyTagline}
            onChange={(e) => onOptionsChange({
              ...options,
              companyTagline: e.target.value
            })}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter company tagline"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Company Description
          <button
            onClick={() => onGenerateContent('description')}
            disabled={isGenerating}
            className="ml-2 text-purple-400 hover:text-purple-300 disabled:text-gray-500"
          >
            <Wand2 className="w-4 h-4 inline-block" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </label>
        <div className="relative">
          <textarea
            value={options.companyDescription}
            onChange={(e) => onOptionsChange({
              ...options,
              companyDescription: e.target.value
            })}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500 h-32"
            placeholder="Enter company description"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default CompanyInfoForm;