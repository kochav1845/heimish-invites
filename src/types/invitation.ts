export interface InvitationTemplate {
  id: string;
  title: string;
  category: 'bar-mitzvah' | 'bat-mitzvah' | 'wedding' | 'brit-milah' | 'pidyon-haben' | 'general' | 'sheva-brachot' | 'tenaim' | 'upsherin' | 'kiddush';
  background: string;
  thumbnail: string;
  fields: TemplateField[];
  defaultValues: Record<string, string>;
  rtl: boolean;
  premium: boolean;
  isLatest?: boolean;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time';
  placeholder: string;
  required: boolean;
  style: FieldStyle;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface FieldStyle {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage width
  height?: number; // percentage height (for textarea)
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  textShadow?: string;
  rotation?: number;
  zIndex: number;
}

export interface InvitationData {
  templateId: string;
  values: Record<string, string>;
  customizations?: {
    backgroundColor?: string;
    overlayOpacity?: number;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpeg';
  quality: number;
  size: 'a4' | 'letter' | 'custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}