import React from 'react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Code, Mail, Phone, MapPin } from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const Footer: React.FC = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const handleLogoClick = () => {
    setAdminClickCount(prev => prev + 1);
    
    // Reset counter after 3 seconds
    setTimeout(() => {
      setAdminClickCount(0);
    }, 3000);
    
    // Show admin login after 5 clicks
    if (adminClickCount >= 4) {
      setShowAdminLogin(true);
      setAdminClickCount(0);
    }
  };

  const handleAdminLogin = (success: boolean) => {
    setShowAdminLogin(false);
    if (success) {
      setShowAdminDashboard(true);
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-900 to-black py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                title={adminClickCount > 0 ? `${5 - adminClickCount} more clicks for admin` : ''}
              >
                <Code size={32} className="text-white" />
                <h2 className="text-2xl font-bold text-white">StarDev</h2>
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin size={18} />
                <span>Brooklyn, NY</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} />
                <span>(347) 718-6080</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} />
                <span>contact@stardev.dev</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} StarDev. All rights reserved.
            </p>
            {adminClickCount > 0 && (
              <p className="text-center text-purple-400 text-xs mt-2">
                {5 - adminClickCount} more clicks for admin access
              </p>
            )}
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showAdminLogin && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
        {showAdminDashboard && (
          <AdminDashboard
            onClose={() => setShowAdminDashboard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;