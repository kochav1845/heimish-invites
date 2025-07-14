import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Search, Globe, Mail, Video, Image, MessageSquare, Phone, MessageCircle, CreditCard, BarChart2, Headphones, Paintbrush } from 'lucide-react';
import { images } from '../assets/images';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

const features: Feature[] = [
  {
    title: "Responsive Design",
    description: "Beautiful on every device",
    icon: Smartphone
  },
  {
    title: "SEO Setup",
    description: "Google search visibility",
    icon: Search
  },
  {
    title: "Domain Setup",
    description: "Expert consultation",
    icon: Globe
  },
  {
    title: "Contact Forms",
    description: "User-friendly interfaces",
    icon: Mail
  },
  {
    title: "Media Integration",
    description: "Audio & video embeds",
    icon: Video
  },
  {
    title: "Professional Images",
    description: "Getty/Shutterstock access",
    icon: Image
  },
  {
    title: "Email Integration",
    description: "Automated submissions",
    icon: MessageSquare
  },
  {
    title: "Phone Integration",
    description: "Seamless communication",
    icon: Phone
  },
  {
    title: "SMS Integration",
    description: "Direct messaging",
    icon: MessageCircle
  },
  {
    title: "eCommerce Setup",
    description: "Secure payments",
    icon: CreditCard
  },
  {
    title: "Analytics",
    description: "Full data insights",
    icon: BarChart2
  },
  {
    title: "Priority Support",
    description: "24/7 assistance",
    icon: Headphones
  },
  {
    title: "Graphics & Animations",
    description: "Dynamic visuals",
    icon: Paintbrush
  }
];

const FeatureReel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-michroma tracking-wider text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
        >
          Our Services
        </motion.h2>
        
        <div 
          ref={containerRef}
          className="overflow-x-hidden relative"
        >
          <div className="flex gap-8 py-8 animate-scroll whitespace-nowrap">
            {[...features, ...features].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: -30, x: -50 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: 30, x: 50 }}
                transition={{ duration: 0.8, delay: (index % features.length) * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex-none w-72 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-6 rounded-xl relative overflow-hidden group"
                style={{
                  backgroundImage: `url('${images.features.background}')`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: '50% 50%'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <motion.div 
                    className="h-16 w-16 flex items-center justify-center text-primary-400 bg-gray-800/50 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      filter: [
                        'brightness(1)',
                        'brightness(1.2)',
                        'brightness(1)'
                      ]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {React.createElement(feature.icon, { size: 32 })}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default FeatureReel;