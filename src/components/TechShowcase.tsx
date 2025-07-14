import React from 'react';
import { motion } from 'framer-motion';
import { images } from '../assets/images';

interface TechBox {
  name: string;
  logo: string;
  gradient: string;
  description: string;
  size?: 'normal' | 'large';
}

const technologies: TechBox[] = [
  {
    name: 'React',
    logo: images.tech.react,
    gradient: 'from-[#61DAFB] to-[#3178C6]',
    description: 'Modern UI Development'
  },
  {
    name: 'Node.js',
    logo: images.tech.node,
    gradient: 'from-[#68A063] to-[#43853d]',
    description: 'Backend Excellence'
  },
  {
    name: 'Supabase & PostgreSQL',
    logo: images.tech.postgres,
    gradient: 'from-[#3ECF8E] to-[#336791]',
    description: 'Powerful Database Solutions',
    size: 'large'
  },
  {
    name: 'Stripe Integration',
    logo: images.tech.stripe,
    gradient: 'from-[#6772E5] to-[#4B45B2]',
    description: 'Secure Payment Processing'
  },
  {
    name: 'AWS Services',
    logo: images.tech.aws,
    gradient: 'from-[#FF9900] to-[#232F3E]',
    description: 'Cloud Infrastructure'
  },
  {
    name: 'Azure Solutions',
    logo: images.tech.azure,
    gradient: 'from-[#00A4EF] to-[#0078D4]',
    description: 'Enterprise Cloud'
  },
  {
    name: 'OpenAI Integration',
    logo: images.tech.openai,
    gradient: 'from-[#74AA9C] to-[#3E8E75]',
    description: 'AI-Powered Features',
    size: 'large'
  },
  {
    name: 'Google Services',
    logo: images.tech.google,
    gradient: 'from-[#4285F4] to-[#34A853]',
    description: 'Search & Analytics'
  }
];

const TechShowcase: React.FC = () => {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="container mx-auto">
        <h2 className="text-4xl font-michroma tracking-wider text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Integrations & Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-64 rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Base background */}
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
              
              {/* Animated gradient background */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${tech.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0`}
              />
              
              {/* Content container */}
              <div className="relative h-full p-6 flex flex-col items-center justify-center">
                {/* Company Logo */}
                <motion.div
                  className={`${tech.size === 'large' ? 'w-40 h-40' : 'w-32 h-32'} mb-4`}
                  animate={{
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    className={`w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300 ${
                      tech.size === 'large' ? 'scale-125' : ''
                    }`}
                    loading="lazy"
                  />
                </motion.div>
                
                {/* Name with slide-up effect */}
                <h3 className="text-xl font-semibold text-white mb-3 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {tech.name}
                </h3>
                
                {/* Description with fade-in effect */}
                <p className="text-gray-400 group-hover:text-white text-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {tech.description}
                </p>
                
                {/* Shine effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="absolute inset-[-50%] transform rotate-45 translate-y-full group-hover:translate-y-[-60%] transition-transform duration-1000 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechShowcase;