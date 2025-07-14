import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="relative py-20 px-4 md:px-8">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent to-black/80"></div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-transparent to-black/80"></div>
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                <motion.div
                  animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="text-primary-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;