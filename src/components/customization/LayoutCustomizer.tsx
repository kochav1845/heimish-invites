import React from 'react';
import { CustomizationOptions } from '../../types/customization';
import { Layout, AlignLeft, AlignCenter, AlignJustify, Maximize2, Minimize2 } from 'lucide-react';

interface LayoutCustomizerProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
}

const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({ options, onOptionsChange }) => {
  const navbarStyles: Array<{ value: CustomizationOptions['navbarStyle']; label: string; icon: React.ElementType }> = [
    { value: 'sticky', label: 'Sticky Navigation', icon: Layout },
    { value: 'minimal', label: 'Minimal Header', icon: AlignCenter },
    { value: 'sidebar', label: 'Sidebar Menu', icon: AlignLeft }
  ];

  const layoutWidths = [
    { value: 'default', label: 'Default Width', icon: Layout },
    { value: 'wide', label: 'Wide Layout', icon: Maximize2 },
    { value: 'full', label: 'Full Width', icon: AlignJustify }
  ];

  const spacingOptions = [
    { value: 'compact', label: 'Compact', icon: Minimize2 },
    { value: 'comfortable', label: 'Comfortable', icon: Layout },
    { value: 'spacious', label: 'Spacious', icon: Maximize2 }
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Left Aligned', icon: AlignLeft },
    { value: 'center', label: 'Center Aligned', icon: AlignCenter }
  ];

  return (
    <div className="space-y-8" onScroll={(e) => e.stopPropagation()}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Navigation Style</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {navbarStyles.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onOptionsChange({ ...options, navbarStyle: value })}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                options.navbarStyle === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Maximize2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Content Width</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {layoutWidths.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onOptionsChange({
                ...options,
                layout: { ...options.layout, maxWidth: value as 'default' | 'wide' | 'full' }
              })}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                options.layout?.maxWidth === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Spacing</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {spacingOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onOptionsChange({
                ...options,
                layout: { ...options.layout, spacing: value as 'compact' | 'comfortable' | 'spacious' }
              })}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                options.layout?.spacing === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <AlignCenter className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Content Alignment</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {alignmentOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onOptionsChange({
                ...options,
                layout: { ...options.layout, contentAlignment: value as 'left' | 'center' }
              })}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                options.layout?.contentAlignment === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutCustomizer;