import React from 'react';
import { motion } from 'framer-motion';

interface AlternatingSectionProps {
  title: string;
  description: string;
  quote?: string;
  imageSrc?: string;
  imageAlt?: string;
  isImageLeft?: boolean;
  customComponent?: React.ReactNode; 
}

const AlternatingSection: React.FC<AlternatingSectionProps> = ({
  title,
  description,
  quote,
  imageSrc,
  imageAlt,
  isImageLeft = true,
  customComponent,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-4 md:px-8 "
    >
      <div className="absolute overflow-visible inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent to-black/80 "></div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-transparent to-black/80"></div>
      
      <div className={`container mx-auto flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 relative z-10`}>
        <div className="w-full md:w-1/2">
          {customComponent ? (
            <div className="flex justify-center items-center">{customComponent}</div>
          ) : imageSrc ? (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              src={imageSrc}
              alt={imageAlt || title}
              className="rounded-lg shadow-2xl w-full h-auto object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="w-full md:w-1/2">
          <motion.h2
            initial={{ opacity: 0, x: isImageLeft ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-michroma tracking-wider mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent leading-tight pt-2"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: isImageLeft ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-300 text-lg mb-6"
          >
            {description}
          </motion.p>
          {quote && (
            <motion.blockquote
              initial={{ opacity: 0, x: isImageLeft ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="border-l-4 border-primary-400 pl-4 italic text-gray-400"
            >
              {quote}
            </motion.blockquote>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AlternatingSection;