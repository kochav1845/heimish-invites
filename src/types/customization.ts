export interface CustomizationOptions {
  font: {
    main: string;
    secondary: string;
  };
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  companyTagline: string;
  companyDescription: string;
  heroImage?: {
    type: 'upload' | 'ai';
    url: string;
    prompt?: string;
  };
  sections: {
    hero: boolean;
    about: boolean;
    testimonials: boolean;
    blog: boolean;
    features: boolean;
    contact: boolean;
    shop: boolean;
    faq: boolean;
    pricing: boolean;
  };
  animations: {
    scroll: {
      fadeIn: boolean;
      slideUp: boolean;
    };
    hover: {
      scale: boolean;
      glow: boolean;
    };
  };
  layout: {
    maxWidth: 'default' | 'wide' | 'full';
    spacing: 'compact' | 'comfortable' | 'spacious';
    contentAlignment: 'left' | 'center';
  };
  navbarStyle: 'sticky' | 'minimal' | 'sidebar';
}

export interface UserInfo {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
}

export interface PreviewProps {
  options: CustomizationOptions;
  onSectionSelect?: (section: keyof CustomizationOptions['sections']) => void;
}