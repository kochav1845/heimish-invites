import React from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { CustomizationOptions } from '../../types/customization';
import { Palette, Type, Wand2 } from 'lucide-react';

interface StyleCustomizerProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
  selectedFont: 'main' | 'secondary';
  onFontTypeChange: (type: 'main' | 'secondary') => void;
  fonts: {
    main: string[];
    secondary: string[];
  };
  onGenerateStyleSuggestions: () => void;
  isGeneratingStyle: boolean;
}

const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  options,
  onOptionsChange,
  selectedFont,
  onFontTypeChange,
  fonts,
  onGenerateStyleSuggestions,
  isGeneratingStyle
}) => {
  return (
    <div className="space-y-8\" onScroll={(e) => e.stopPropagation()}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Colors</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3">Primary Color</label>
            <div className="relative">
              <RgbaColorPicker
                color={JSON.parse(options.primaryColor)}
                onChange={(color) => onOptionsChange({ ...options, primaryColor: JSON.stringify(color) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-3">Secondary Color</label>
            <div className="relative">
              <RgbaColorPicker
                color={JSON.parse(options.secondaryColor)}
                onChange={(color) => onOptionsChange({ ...options, secondaryColor: JSON.stringify(color) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-3">Accent Color</label>
            <div className="relative">
              <RgbaColorPicker
                color={JSON.parse(options.accentColor)}
                onChange={(color) => onOptionsChange({ ...options, accentColor: JSON.stringify(color) })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Typography</h3>
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => onFontTypeChange('main')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                selectedFont === 'main' ? 'bg-purple-600' : 'bg-gray-700'
              } transition-colors`}
            >
              Body Font
            </button>
            <button
              onClick={() => onFontTypeChange('secondary')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                selectedFont === 'secondary' ? 'bg-purple-600' : 'bg-gray-700'
              } transition-colors`}
            >
              Headline Font
            </button>
          </div>
          <div className="relative">
            <select
              value={options.font[selectedFont]}
              onChange={(e) => onOptionsChange({
                ...options,
                font: {
                  ...options.font,
                  [selectedFont]: e.target.value
                }
              })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {fonts[selectedFont].map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </select>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-gray-400 text-sm">
              Preview text in {options.font[selectedFont]}
            </p>
            <p className="mt-2 text-white" style={{ fontFamily: options.font[selectedFont] }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">AI Style Suggestions</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Generate a complete style combination with colors and fonts that work perfectly together
        </p>
        <button
          onClick={onGenerateStyleSuggestions}
          disabled={isGeneratingStyle}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          {isGeneratingStyle ? 'Generating...' : 'Generate Style Combination'}
        </button>
      </div>
    </div>
  );
};

export default StyleCustomizer;