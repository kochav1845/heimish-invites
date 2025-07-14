import React from 'react';
import { motion } from 'framer-motion';
import { Video, Image, RefreshCw, Wand2 } from 'lucide-react';

interface VideoOptionsProps {
  onSelect: (option: 'image-to-video' | 'extend-video' | 'modify-video') => void;
}

const VideoOptions: React.FC<VideoOptionsProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-black/90 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-michroma text-white mb-8 text-center">
        Create AI-Powered Videos
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => onSelect('image-to-video')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">Image to Video</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Transform static images into dynamic videos
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('extend-video')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <RefreshCw className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">Extend Video</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Continue and expand existing videos
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelect('modify-video')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wand2 className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">Text to Video</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Create videos from text descriptions
          </p>
        </motion.button>
      </div>
      
      <div className="mt-10 max-w-xl bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white text-lg mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Note
        </h3>
        <p className="text-gray-300 text-sm">
          Video generation can take 5-10 minutes to complete. Please be patient during processing.
          The system will show updates on your generation status.
        </p>
      </div>
    </div>
  );
};

export default VideoOptions;