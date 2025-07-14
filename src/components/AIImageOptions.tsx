import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Type, Upload } from 'lucide-react';

interface AIImageOptionsProps {
  onSelect: (option: 'text-to-image' | 'image-to-image') => void;
}

const AIImageOptions: React.FC<AIImageOptionsProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => onSelect('text-to-image')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center text-center gap-4">
            <Type className="w-16 h-16 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <h3 className="text-xl font-michroma text-white mb-2">Text to Image</h3>
            <p className="text-gray-400 group-hover:text-gray-300">
              Generate images from text descriptions
            </p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('image-to-image')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center text-center gap-4">
            <Upload className="w-16 h-16 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <h3 className="text-xl font-michroma text-white mb-2">Image to Image</h3>
            <p className="text-gray-400 group-hover:text-gray-300">
              Transform or modify existing images
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default AIImageOptions;