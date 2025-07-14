import React from 'react';
import { CustomizationOptions } from '../../types/customization';
import { Layout, FileText, MessageSquare, Newspaper, ShoppingBag, Phone, HelpCircle, DollarSign } from 'lucide-react';

interface SectionSelectorProps {
  options: CustomizationOptions;
  onSectionToggle: (section: keyof CustomizationOptions['sections']) => void;
}

const SectionSelector: React.FC<SectionSelectorProps> = ({ options, onSectionToggle }) => {
  const sections = [
    { key: 'hero', label: 'Hero Section', icon: Layout },
    { key: 'about', label: 'About Us', icon: FileText },
    { key: 'features', label: 'Features', icon: Layout },
    { key: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { key: 'blog', label: 'Blog', icon: Newspaper },
    { key: 'shop', label: 'Shop', icon: ShoppingBag },
    { key: 'contact', label: 'Contact', icon: Phone },
    { key: 'faq', label: 'FAQ', icon: HelpCircle },
    { key: 'pricing', label: 'Pricing', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Page Sections</h2>
          <p className="text-gray-400">Choose which sections to include in your website</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map(({ key, label, icon: Icon }) => (
              <button 
                key={key}
                onClick={() => onSectionToggle(key as keyof CustomizationOptions['sections'])}
                className={`group relative p-6 rounded-xl transition-all ${
                  options.sections[key as keyof CustomizationOptions['sections']] 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <Icon size={24} className={`${
                    options.sections[key as keyof CustomizationOptions['sections']]
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  } transition-colors`} />
                  <span className={`${
                    options.sections[key as keyof CustomizationOptions['sections']]
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  } transition-colors text-sm font-medium`}>
                    {label}
                  </span>
                </div>

                <div className={`absolute top-3 right-3 w-4 h-4 rounded transition-all ${
                  options.sections[key as keyof CustomizationOptions['sections']]
                    ? 'bg-white'
                    : 'border border-gray-500'
                }`}>
                  {options.sections[key as keyof CustomizationOptions['sections']] && (
                    <svg
                      className="w-full h-full text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSelector;