import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://ahmrghovmuxowchijumv.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          from: formData.email,
          name: formData.name,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-24 px-4 z-1000 bg-transparant">
      <div className="container mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
        >
          Contact Us
        </motion.h2>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border-b-2 border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors peer"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-5 peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:-top-5">
              Name
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border-b-2 border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors peer"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-5 peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:-top-5">
              Email
            </label>
          </div>
          <div className="relative">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-gray-900 border-b-2 border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors peer"
              placeholder=" "
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all peer-focus:-top-5 peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:-top-5">
              Message
            </label>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </motion.button>
        </motion.form>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/50 text-red-400 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
        
        {isSubmitted && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-900/50 text-green-400 rounded-lg text-center"
          >
            Thank you for your message! We'll get back to you soon.
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Contact;