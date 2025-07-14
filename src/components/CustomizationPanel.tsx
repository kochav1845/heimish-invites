import React, { useEffect, useRef, useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { CustomizationOptions } from '../types/customization';
import { Settings, Layout, Type, Wand2, ArrowLeft, Check, Upload } from 'lucide-react';
import WebFont from 'webfontloader';
import PreviewPanel from './PreviewPanel';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Import components
import UserInfoForm from './customization/UserInfoForm';
import CompanyInfoForm from './customization/CompanyInfoForm';
import MediaUploader from './customization/MediaUploader';
import SectionSelector from './customization/SectionSelector';
import StyleCustomizer from './customization/StyleCustomizer';
import LayoutCustomizer from './customization/LayoutCustomizer';
import AnimationCustomizer from './customization/AnimationCustomizer';
import DomainChecker from './DomainChecker';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface CustomizationPanelProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
  onClose?: () => void;
}

interface UserInfo {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
}

const CenteredLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
    {children}
  </div>
);

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, onOptionsChange, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof CustomizationOptions['sections'] | null>(null);
  const [selectedFont, setSelectedFont] = useState<'main' | 'secondary'>('main');
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'animation' | 'content'>('style');
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    projectType: '',
    budget: '',
    description: ''
  });

  const fonts = {
    main: [
      // Body/Text Fonts - Clean and readable
      'Inter',
      'Plus Jakarta Sans', 
      'Poppins',
      'DM Sans',
      'Work Sans',
      'Manrope',
      'Space Grotesk',
      'Satoshi',
      'Outfit',
      'Helvetica Neue'
    ],
    secondary: [
      // Display/Headline Fonts - Stylish and impactful
      'Michroma',
      'Bebas Neue',
      'Playfair Display',
      'Abril Fatface',
      'Raleway',
      'Oswald',
      'Archivo Black',
      'Anton',
      'Unica One',
      'Lora'
    ]
  };

  useEffect(() => {
    WebFont.load({
      google: {
        families: [
          // Body fonts
          'Inter:400,500,600,700',
          'Plus Jakarta Sans:400,500,600,700',
          'Poppins:400,500,600,700',
          'DM Sans:400,500,600,700',
          'Work Sans:400,500,600,700',
          'Manrope:400,500,600,700',
          'Space Grotesk:400,500,600,700',
          'Outfit:400,500,600,700',
          // Display fonts
          'Michroma:400',
          'Bebas Neue:400',
          'Playfair Display:400,700',
          'Abril Fatface:400',
          'Raleway:400,500,600,700',
          'Oswald:400,500,600,700',
          'Archivo Black:400',
          'Anton:400',
          'Lora:400,700'
        ]
      }
    });
  }, []);

  const generateAIContent = async (type: 'tagline' | 'description') => {
    if (!options.companyName.trim()) {
      setError('Company name is required to generate content');
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          companyName: options.companyName,
          companyTagline: type === 'tagline' ? '' : options.companyTagline,
          type
        }),
      });

      let errorMessage = 'Failed to generate content';
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorMessage);
      }

      const data = await response.json().catch(() => ({}));
      
      if (!data || !data.description) {
        throw new Error('No content was generated. Please try again.');
      }

      if (type === 'tagline') {
        onOptionsChange({
          ...options,
          companyTagline: data.description
        });
      } else {
        onOptionsChange({
          ...options,
          companyDescription: data.description
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content. Please try again.';
      setError(errorMessage);
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customization-images')
          .upload(`${Date.now()}-${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('customization-images')
          .getPublicUrl(uploadData.path);

        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .insert([{
            url: publicUrl,
            type: 'upload'
          }])
          .select()
          .single();

        if (imageError) throw imageError;

        onOptionsChange({
          ...options,
          heroImage: {
            type: 'upload',
            url: publicUrl
          }
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const generateImage = async () => {
    if (!imagePrompt) {
      setError('Please enter a prompt for the image generation');
      return;
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const { imageBase64 } = await response.json();
      
      if (imageBase64) {
        const blob = await fetch(`data:image/png;base64,${imageBase64}`).then(res => res.blob());
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customization-images')
          .upload(`${Date.now()}-ai-generated.png`, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('customization-images')
          .getPublicUrl(uploadData.path);

        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .insert([{
            url: publicUrl,
            type: 'ai',
            prompt: imagePrompt
          }])
          .select()
          .single();

        if (imageError) throw imageError;

        onOptionsChange({
          ...options,
          heroImage: {
            type: 'ai',
            url: publicUrl,
            prompt: imagePrompt
          }
        });
      }
    } catch (error) {
      setError('Failed to generate and save image. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateStyleSuggestions = async () => {
    setIsGeneratingStyle(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-style-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          companyName: options.companyName,
          companyDescription: options.companyDescription,
          projectType: userInfo.projectType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate style suggestions');
      }

      const data = await response.json();
      
      if (data.colors && data.fonts) {
        onOptionsChange({
          ...options,
          primaryColor: JSON.stringify(data.colors.primary),
          secondaryColor: JSON.stringify(data.colors.secondary),
          accentColor: JSON.stringify(data.colors.accent),
          font: {
            main: data.fonts.main,
            secondary: data.fonts.secondary
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate style suggestions. Please try again.';
      setError(errorMessage);
      console.error('Error generating style suggestions:', error);
    } finally {
      setIsGeneratingStyle(false);
    }
  };

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userInfo,
          customizationOptions: options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 6) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onClose?.();
    } else {
      setStep(prev => prev - 1);
      setError(null);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-lg z-50 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Thank You!</h2>
          <p className="text-gray-300 mb-6">
            Your request has been submitted successfully. We'll be in touch with you shortly to discuss your project.
          </p>
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              }
              navigate('/');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <UserInfoForm
            userInfo={userInfo}
            onChange={handleUserInfoChange}
            error={error}
          />
        );

      case 2:
        return (
          <CenteredLayout>
            <CompanyInfoForm
              options={options}
              onOptionsChange={onOptionsChange}
              isGenerating={isGenerating}
              onGenerateContent={generateAIContent}
              error={error}
            />
          </CenteredLayout>
        );

      case 3:
        return (
          <CenteredLayout>
            <MediaUploader
              options={options}
              onOptionsChange={onOptionsChange}
              imagePrompt={imagePrompt}
              onImagePromptChange={setImagePrompt}
              onUpload={handleImageUpload}
              onGenerate={generateImage}
              isGenerating={isGeneratingImage}
              error={error}
            />
          </CenteredLayout>
        );

      case 4:
        return (
          <CenteredLayout>
            <SectionSelector
              options={options}
              onSectionToggle={(section) => {
                onOptionsChange({
                  ...options,
                  sections: {
                    ...options.sections,
                    [section]: !options.sections[section]
                  }
                });
              }}
            />
          </CenteredLayout>
        );

      case 5:
        return (
          <CenteredLayout>
            <DomainChecker />
          </CenteredLayout>
        );

      case 6:
        return (
          <div className="flex min-h-screen w-full">
            <div 
              className="w-[35%] p-8 space-y-8 bg-gray-900/50 backdrop-blur-sm border-r border-white/10 overflow-y-auto"
              onScroll={(e) => e.stopPropagation()}
              style={{ maxHeight: '100vh' }}
            >
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={() => setActiveTab('style')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'style' ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                >
                  Style
                </button>
                <button
                  onClick={() => setActiveTab('layout')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'layout' ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                >
                  Layout
                </button>
                <button
                  onClick={() => setActiveTab('animation')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'animation' ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                >
                  Animation
                </button>
              </div>

              {activeTab === 'style' && (
                <>
                  <StyleCustomizer
                    options={options}
                    onOptionsChange={onOptionsChange}
                    selectedFont={selectedFont}
                    onFontTypeChange={setSelectedFont}
                    fonts={fonts}
                    onGenerateStyleSuggestions={generateStyleSuggestions}
                    isGeneratingStyle={isGeneratingStyle}
                  />
                </>
              )}

              {activeTab === 'layout' && (
                <LayoutCustomizer
                  options={options}
                  onOptionsChange={onOptionsChange}
                />
              )}

              {activeTab === 'animation' && (
                <AnimationCustomizer
                  options={options}
                  onOptionsChange={onOptionsChange}
                />
              )}
            </div>
            
            <div className="w-[65%] p-8 bg-gray-900 overflow-hidden">
              <h2 className="text-2xl font-semibold text-white mb-6">Preview</h2>
              <PreviewPanel 
                options={options}
                onSectionSelect={setActiveSection}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-lg z-50 overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBack}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-gray-800/50"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="relative h-full overflow-y-auto">
        {renderStep()}

        {error && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
            <div className="mx-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center">
              {error}
            </div>
          </div>
        )}

        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {step === 6 ? (isSubmitting ? 'Submitting...' : 'Finish') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;