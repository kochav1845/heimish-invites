import { InvitationTemplate } from '../types/invitation';

export const invitationTemplates: InvitationTemplate[] = [
  
     

  // General Templates
  {
    id: 'BRIS-MILAH-103',
    title: 'ברית מילה 3',
    category: 'brit-milah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris3.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris3.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
  {
    id: 'BRIS-MILAH-104',
    title: 'ברית מילה 4',
    category: 'brit-milah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris%204.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris%204.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
  {
    id: 'BRIS-MILAH-102',
    title: 'ברית מילה',
    category: 'brit-milah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris%202.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris%202.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
  {
    id: 'BRIS-MILAH-101',
    title: 'ברית מילה',
    category: 'brit-milah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris1.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/bris/bris1.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
  {
    id: 'FLOWERS-201',
    title: 'Elegant Flowers',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/flowersGirl.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/flowersGirl.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {
      // Default values are now loaded from database placeholders
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'PLAIN-301',
    title: 'Classic Plain',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain1.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain1.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {
      // These are fallback values - actual values come from database
     
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'PLAIN-302',
    title: 'Modern Plain',
    category: 'bar-mitzvah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain2.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain2.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'PLAIN-305',
    title: 'Elegant Plain',
    category: 'general',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain5.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain5.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'PLAIN-303',
    title: 'Simple Plain',
    category: 'general',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain3.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/plain3.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'TNOIM-401',
    title: 'Tnoim Celebration',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'TNOIIM-FLOWERS-101',
    title: 'תנאים עם פרחים',
    category: 'tenaim',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim/tnoiim%20flowers.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim/tnoiim%20flowers.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {}, // Values are managed in the database
    fields: [] // Fields are managed in the database
  },
  {
    id: 'TANAIM-ELEGANT-101',
    title: 'תנאים מהודרים',
    category: 'tenaim',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim/tanaim1.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/tnoiim/tanaim1.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {}, // Values are managed in the database
    fields: [] // Fields are managed in the database
  },
  {
    id: 'LCHAIM-501',
    title: 'LChaim Template',
    category: 'kiddush',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/lchaim%20templete.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/lchaim%20templete.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
   {
    id: 'LCHAIM-502',
    title: '2 קידושא רבה',
    category: 'kiddush',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddush2.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddush2.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
   {
    id: 'LCHAIM-503',
    title:  '3 קידושא רבה',
    category: 'kiddush',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddush3.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddush3.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },
  {
    id: 'KIDDUSH-504',
    title: 'קידושא רבה מהודר',
    category: 'kiddush',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/nice%20kiddush.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/nice%20kiddush.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },

  {
    id: 'KIDDUSH-201',
    title: 'קידושא רבה',
    category: 'kiddush',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddish.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/kiddush/kiddish.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'SHULAM-ZUCHER-101',
    title: 'Shulam Zucher Beer',
    category: 'brit-milah',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {
      // These are fallback values - actual values come from database
      // The admin panel should be used to configure the actual fields
    },
    fields: [] // Fields are now managed in the database via placeholders table
  },
  // Brit Milah Templates


 
  {
    id: 'WEDDING-102',
    title: 'חתונה',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: []
  },
  {
    id: 'WEDDING-ELEGANT-103',
    title: 'חתונה מסורתית',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune1.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune1.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {
     
    },
    fields: []
  },
  {
    id: 'WEDDING-PLAIN-101',
    title: 'חתונה קלאסית',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20plain.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20plain.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: []
  },
  {
    id: 'WEDDING-NICE-101',
    title: 'חתונה מעוצבת',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20nice.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20nice.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: []
  },
  {
    id: 'WEDDING-ROYAL-101',
    title: 'חתונה מלכותית',
    category: 'wedding',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20royel.jpg',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/chasunes/chasune%20royel.jpg',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: []
  },
  // Upsherin Templates

  {
    id: 'UPSHERIN-YIDDISH-101',
    title:'אפשערן',
    category: 'upsherin',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/upsherin/upsherin.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/upsherin/upsherin.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are now managed in the database via placeholders table
  },
  {
    id: 'VACHNACHT-101',
    title: 'וואכנאכט',
    category: 'vachnacht-u-bris', 
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/vachnacht/vachnacht1.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/vachnacht/vachnacht1.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },

  // Pidyon Haben Templates
  {
    id: 'PIDYON-HABEN-102',
    title: 'פדיון הבן מסורתי',
    category: 'pidyon-haben',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/pidyon%20haban/pidyon%20haban%20(1).png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/pidyon%20haban/pidyon%20haban%20(1).png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: [] // Fields are managed in the database via placeholders table
  },



  // Combined Bris event templates
  {
    id: 'VACHNACHT-BRIS-101',
    title: 'וואכנאכט וברית',
    category: 'vachnacht-u-bris',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    rtl: true,
    premium: false,
    isLatest: true,
    defaultValues: {},
    fields: []
  },
  {
    id: 'SHALOM-VACHNACHT-BRIS-101',
    title: 'שלום זכר וואכנאכט וברית',
    category: 'shalom-zachor-vachnacht-u-bris',
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    thumbnail: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/simchas/shullam%20zucher%20beer.png',
    rtl: true,
    premium: false,
    isLatest: false,
    defaultValues: {},
    fields: []
  },
];

export const getTemplateById = (id: string): InvitationTemplate | undefined => {
  return invitationTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): InvitationTemplate[] => {
  if (category === 'all') return invitationTemplates;
  return invitationTemplates.filter(template => template.category === category);
}

// Hebrew category names
export const categoryLabels: Record<string, string> = {
  'all': 'כל התבניות',
  'bar-mitzvah': 'בר מצווה',
  'wedding': 'חתונה',
  'brit-milah': 'ברית מילה',
  'shalom-zachor': 'שלום זכר',
  'vachnacht': 'וואכנאכט',
  'pidyon-haben': 'פדיון הבן',
  'general': 'כללי',
  'sheva-brachot': 'שבע ברכות',
  'tenaim': 'תנאים',
  'bavorfn': 'באווארפן',
  'upsherin':'אפשערן',
  'kiddush': 'קידוש רבה',
  'vachnacht-u-bris': 'וואכנאכט וברית',
  'vachnacht': 'וואכנאכט',
  'shalom-zachor-vachnacht-u-bris': 'שלום זכר וואכנאכט וברית'
};

// Get the latest templates across all categories
export const getLatestTemplates = (): InvitationTemplate[] => {
  return invitationTemplates.filter(template => template.isLatest);
};