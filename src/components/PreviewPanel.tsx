import React, { useRef, useEffect, useState } from 'react';
import { CustomizationOptions } from '../types/customization';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ShoppingBag, User, MessageSquare, HelpCircle, Phone } from 'lucide-react';

interface PreviewPanelProps {
  options: CustomizationOptions;
  onSectionSelect?: (section: keyof CustomizationOptions['sections']) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ options, onSectionSelect }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const primaryColor = JSON.parse(options.primaryColor);
  const secondaryColor = JSON.parse(options.secondaryColor);
  const accentColor = JSON.parse(options.accentColor);

  const rgbaToString = (color: { r: number; g: number; b: number; a: number }) => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  };

  const rgbaToHex = (color: { r: number; g: number; b: number; a: number }) => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  };

  const fadeInAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const hoverAnimation = {
    scale: options.animations?.hover?.scale ? 1.05 : 1,
    filter: options.animations?.hover?.glow ? 'brightness(1.2)' : 'none'
  };

  // Create CSS custom properties for dynamic colors
  const colorStyles = {
    '--primary-color': rgbaToString(primaryColor),
    '--secondary-color': rgbaToString(secondaryColor),
    '--accent-color': rgbaToString(accentColor),
    '--primary-hex': rgbaToHex(primaryColor),
    '--secondary-hex': rgbaToHex(secondaryColor),
    '--accent-hex': rgbaToHex(accentColor),
  } as React.CSSProperties;

  return (
    <div 
      className="w-full h-[calc(100vh-200px)] overflow-y-auto bg-gray-900 rounded-lg shadow-inner" 
      ref={previewRef}
      style={colorStyles}
      onScroll={(e) => e.stopPropagation()}
    >
      <div className="w-full" style={{ 
        fontFamily: options.font.main,
        '--secondary-font': options.font.secondary
      } as React.CSSProperties}>
        {/* Navigation */}
        <nav className={`bg-gray-900/90 backdrop-blur-md p-4 ${options.navbarStyle === 'sticky' ? 'sticky top-0 z-50' : ''}`}>
          <div className="container mx-auto flex justify-between items-center">
            <div 
              className="text-xl font-bold text-white"
              style={{ color: rgbaToString(primaryColor) }}
            >
              {options.companyName || "Logo"}
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {options.sections.about && (
                <span 
                  className="hover:text-white cursor-pointer transition-colors"
                  style={{ color: rgbaToString(secondaryColor) }}
                >
                  About
                </span>
              )}
              {options.sections.blog && (
                <span 
                  className="hover:text-white cursor-pointer transition-colors"
                  style={{ color: rgbaToString(secondaryColor) }}
                >
                  Blog
                </span>
              )}
              {options.sections.contact && (
                <span 
                  className="hover:text-white cursor-pointer transition-colors"
                  style={{ color: rgbaToString(secondaryColor) }}
                >
                  Contact
                </span>
              )}
              {options.sections.faq && (
                <span 
                  className="hover:text-white cursor-pointer transition-colors"
                  style={{ color: rgbaToString(secondaryColor) }}
                >
                  FAQ
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Search 
                className="w-5 h-5 hover:text-white cursor-pointer transition-colors" 
                style={{ color: rgbaToString(secondaryColor) }}
              />
              {options.sections.ecommerce && (
                <ShoppingBag 
                  className="w-5 h-5 hover:text-white cursor-pointer transition-colors"
                  style={{ color: rgbaToString(secondaryColor) }}
                />
              )}
              <User 
                className="w-5 h-5 hover:text-white cursor-pointer transition-colors"
                style={{ color: rgbaToString(secondaryColor) }}
              />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {options.sections.hero && (
          <div className="relative h-[600px] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                backgroundImage: options.heroImage?.url 
                  ? `url(${options.heroImage.url})` 
                  : `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0  flex items-center justify-center text-center p-8">
              <div className="max-w-3xl">
                <motion.h1
                  {...fadeInAnimation}
                  className="text-5xl md:text-6xl font-bold text-white mb-6"
                >
                  {options.companyName || "Your Company Name"}
                </motion.h1>
                <motion.p
                  {...fadeInAnimation}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-white/90 mb-8"
                >
                  {options.companyTagline || "Your Compelling Tagline"}
                </motion.p>
                <motion.button 
                  {...fadeInAnimation}
                  transition={{ delay: 0.4 }}
                  whileHover={hoverAnimation}
                  className="px-8 py-4 rounded-lg font-semibold text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`
                  }}
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-24 py-24 px-4 md:px-8">
          {/* Blog Section */}
          {options.sections.blog && (
            <motion.section 
              {...fadeInAnimation}
              className="container mx-auto max-w-6xl"
            >
              <h2 
                className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent leading-tight"
                style={{
                  background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Latest Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={hoverAnimation}
                    className="bg-gray-800/50 rounded-xl overflow-hidden border transition-all duration-300"
                    style={{
                      borderColor: rgbaToString(secondaryColor) + '40'
                    }}
                  >
                    <div 
                      className="h-48"
                      style={{
                        background: `linear-gradient(135deg, ${rgbaToString(primaryColor)}40 0%, ${rgbaToString(accentColor)}40 100%)`
                      }}
                    />
                    <div className="p-6">
                      <h3 
                        className="text-xl font-semibold mb-2"
                        style={{ color: rgbaToString(primaryColor) }}
                      >
                        Article Title {i}
                      </h3>
                      <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* FAQ Section */}
          {options.sections.faq && (
            <motion.section 
              {...fadeInAnimation}
              className="container mx-auto max-w-4xl"
            >
              <h2 
                className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent leading-tight"
                style={{
                  background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={hoverAnimation}
                    className="bg-gray-800/50 p-6 rounded-xl border transition-all duration-300"
                    style={{
                      borderColor: rgbaToString(secondaryColor) + '40'
                    }}
                  >
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: rgbaToString(primaryColor) }}
                    >
                      Question {i}?
                    </h3>
                    <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Contact Section */}
          {options.sections.contact && (
            <motion.section 
              {...fadeInAnimation}
              className="container mx-auto max-w-4xl"
            >
              <h2 
                className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent leading-tight"
                style={{
                  background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Get In Touch
              </h2>
              <div 
                className="bg-gray-800/50 p-8 rounded-xl border"
                style={{
                  borderColor: rgbaToString(secondaryColor) + '40'
                }}
              >
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full p-3 bg-gray-700/50 rounded-lg text-white transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: rgbaToString(secondaryColor) + '60',
                        '--tw-ring-color': rgbaToString(primaryColor)
                      } as React.CSSProperties}
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="w-full p-3 bg-gray-700/50 rounded-lg text-white transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: rgbaToString(secondaryColor) + '60',
                        '--tw-ring-color': rgbaToString(primaryColor)
                      } as React.CSSProperties}
                    />
                  </div>
                  <textarea 
                    placeholder="Your Message" 
                    className="w-full p-3 bg-gray-700/50 rounded-lg text-white h-32 transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: rgbaToString(secondaryColor) + '60',
                      '--tw-ring-color': rgbaToString(primaryColor)
                    } as React.CSSProperties}
                  ></textarea>
                  <motion.button 
                    whileHover={hoverAnimation}
                    className="w-full py-3 text-white rounded-lg font-semibold transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`
                    }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </div>
            </motion.section>
          )}

          {/* Features Section */}
          {options.sections.features && (
            <motion.section 
              {...fadeInAnimation}
              className="container mx-auto max-w-6xl"
            >
              <h2 
                className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent leading-tight"
                style={{
                  background: `linear-gradient(135deg, ${rgbaToString(primaryColor)} 0%, ${rgbaToString(accentColor)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Our Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={hoverAnimation}
                    className="bg-gray-800/50 p-6 rounded-xl text-center border transition-all duration-300"
                    style={{
                      borderColor: rgbaToString(secondaryColor) + '40'
                    }}
                  >
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${rgbaToString(primaryColor)}40 0%, ${rgbaToString(accentColor)}40 100%)`
                      }}
                    >
                      <MessageSquare 
                        className="w-8 h-8"
                        style={{ color: rgbaToString(primaryColor) }}
                      />
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: rgbaToString(primaryColor) }}
                    >
                      Feature {i}
                    </h3>
                    <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;