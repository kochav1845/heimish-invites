import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import InvitationPlatform from './invitations/InvitationPlatform';

const IntegrationsPage: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash) {
      setIsLoading(true);
      setSelectedCategory(hash);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }

    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-black/90 p-8">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src="https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/3dintro.png"
              alt="Loading"
              className="w-64 h-64 object-contain"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.h2
              className="text-2xl font-michroma text-white mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              The future is loading...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {!showOptions ? (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-michroma text-white mb-4">
              Digital Invitations
            </h1>
            <p className="text-gray-400">Loading invitation options...</p>
          </motion.div>
        </div>
      ) : (
        <InvitationPlatform />
      )}
    </div>
  );
};

export default IntegrationsPage;