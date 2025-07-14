
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Image, Video } from 'lucide-react';

interface AIOptionsProps {
  onSelect: (option: 'chat' | 'image' | 'video') => void;
}

const AIOptions: React.FC<AIOptionsProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => onSelect('chat')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">AI Chat</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Engage in intelligent conversations with our AI assistant
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('image')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">AI Image Creation</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Generate stunning images with advanced AI technology
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelect('video')}
          className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Video className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <h3 className="text-xl font-michroma text-white mb-2">AI Video Creation</h3>
          <p className="text-gray-400 group-hover:text-gray-300">
            Create immersive videos with AI-powered generation
          </p>
        </motion.button>
      </div>
    </div>
  );
};

export default AIOptions;
