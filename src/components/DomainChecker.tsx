import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Loader2, Calendar, Globe2, Building } from 'lucide-react';

interface DomainResponse {
  availability: string;
  domain: string;
  keyword: string;
  tld: string;
  status?: string[];
  ns?: string[];
  dates?: {
    created: string;
    updated: string;
    expiry: string;
    expiryDays: number;
  };
  registrar?: {
    url: string;
    name: string;
    whois: string;
  };
}

const DomainChecker: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<DomainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDomain = async () => {
    setIsChecking(true);
    setResult(null);
    setError(null);

    try {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Please enter a valid domain name (e.g., example.com)');
      }

      const response = await fetch(`https://domains-api.p.rapidapi.com/domains/${domain}?mode=standard`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'b671173dabmshaecbdde806b4305p12c6a3jsn0a3776ff99fa',
          'X-RapidAPI-Host': 'domains-api.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check domain availability');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check domain availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain) {
      checkDomain();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="Enter your domain name (e.g., example.com)"
            className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-12"
          />
          <button
            type="submit"
            disabled={!domain || isChecking}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} />
          </button>
        </div>

        {isChecking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-center text-white"
          >
            <Loader2 className="animate-spin mr-2" size={20} />
            Checking availability...
          </motion.div>
        )}

        <AnimatePresence>
          {result && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-6 rounded-lg ${
                result.availability === 'available' 
                  ? 'bg-green-900/50 border border-green-500/50' 
                  : 'bg-red-900/50 border border-red-500/50'
              }`}
            >
              <div className="flex items-center mb-4">
                {result.availability === 'available' ? (
                  <Check className="text-green-400 mr-2\" size={24} />
                ) : (
                  <X className="text-red-400 mr-2" size={24} />
                )}
                <span className="text-xl text-white font-semibold">
                  {domain} is {result.availability}
                </span>
              </div>

              {result.availability === 'registered' && (
                <div className="space-y-4 mt-4">
                  {result.dates && (
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold flex items-center">
                        <Calendar size={18} className="mr-2 text-purple-400" />
                        Registration Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-300">
                          <span className="block text-gray-400">Created:</span>
                          {formatDate(result.dates.created)}
                        </div>
                        <div className="text-gray-300">
                          <span className="block text-gray-400">Expires:</span>
                          {formatDate(result.dates.expiry)}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.registrar && (
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold flex items-center">
                        <Building size={18} className="mr-2 text-purple-400" />
                        Registrar Information
                      </h3>
                      <div className="text-gray-300">
                        <a 
                          href={result.registrar.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {result.registrar.name}
                        </a>
                      </div>
                    </div>
                  )}

                  {result.ns && result.ns.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold flex items-center">
                        <Globe2 size={18} className="mr-2 text-purple-400" />
                        Nameservers
                      </h3>
                      <ul className="text-gray-300 space-y-1">
                        {result.ns.map((ns, index) => (
                          <li key={index}>{ns}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default DomainChecker;