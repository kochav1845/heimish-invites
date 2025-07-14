import React from 'react';
import { CustomizationOptions } from '../../types/customization';
import { Play, Pause, FastForward, RotateCcw, Sparkles } from 'lucide-react';

interface AnimationCustomizerProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
}

const AnimationCustomizer: React.FC<AnimationCustomizerProps> = ({ options, onOptionsChange }) => {
  return (
    <div className="space-y-8\" onScroll={(e) => e.stopPropagation()}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <FastForward className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Scroll Animations</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button
            className={`p-4 rounded-lg flex items-center justify-between ${
              options.animations?.scroll?.fadeIn ? 'bg-purple-600' : 'bg-gray-700'
            }`}
            onClick={() => onOptionsChange({
              ...options,
              animations: {
                ...options.animations,
                scroll: {
                  ...options.animations?.scroll,
                  fadeIn: !options.animations?.scroll?.fadeIn
                }
              }
            })}
          >
            <div className="flex items-center gap-3">
              <FastForward size={20} />
              <span>Fade In</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative ${
              options.animations?.scroll?.fadeIn ? 'bg-purple-400' : 'bg-gray-600'
            }`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                options.animations?.scroll?.fadeIn ? 'right-1' : 'left-1'
              }`} />
            </div>
          </button>

          <button
            className={`p-4 rounded-lg flex items-center justify-between ${
              options.animations?.scroll?.slideUp ? 'bg-purple-600' : 'bg-gray-700'
            }`}
            onClick={() => onOptionsChange({
              ...options,
              animations: {
                ...options.animations,
                scroll: {
                  ...options.animations?.scroll,
                  slideUp: !options.animations?.scroll?.slideUp
                }
              }
            })}
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={20} />
              <span>Slide Up</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative ${
              options.animations?.scroll?.slideUp ? 'bg-purple-400' : 'bg-gray-600'
            }`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                options.animations?.scroll?.slideUp ? 'right-1' : 'left-1'
              }`} />
            </div>
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Hover Effects</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button
            className={`p-4 rounded-lg flex items-center justify-between ${
              options.animations?.hover?.scale ? 'bg-purple-600' : 'bg-gray-700'
            }`}
            onClick={() => onOptionsChange({
              ...options,
              animations: {
                ...options.animations,
                hover: {
                  ...options.animations?.hover,
                  scale: !options.animations?.hover?.scale
                }
              }
            })}
          >
            <div className="flex items-center gap-3">
              <Play size={20} />
              <span>Scale</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative ${
              options.animations?.hover?.scale ? 'bg-purple-400' : 'bg-gray-600'
            }`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                options.animations?.hover?.scale ? 'right-1' : 'left-1'
              }`} />
            </div>
          </button>

          <button
            className={`p-4 rounded-lg flex items-center justify-between ${
              options.animations?.hover?.glow ? 'bg-purple-600' : 'bg-gray-700'
            }`}
            onClick={() => onOptionsChange({
              ...options,
              animations: {
                ...options.animations,
                hover: {
                  ...options.animations?.hover,
                  glow: !options.animations?.hover?.glow
                }
              }
            })}
          >
            <div className="flex items-center gap-3">
              <Pause size={20} />
              <span>Glow</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative ${
              options.animations?.hover?.glow ? 'bg-purple-400' : 'bg-gray-600'
            }`}>
              <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                options.animations?.hover?.glow ? 'right-1' : 'left-1'
              }`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationCustomizer;