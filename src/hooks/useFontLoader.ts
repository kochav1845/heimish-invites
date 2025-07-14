import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { debounce } from '../utils/debounce';

// Check for required environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are present
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

interface Font {
  id: string;
  name: string;
  url: string;
  type: string;
  is_hebrew: boolean;
}

// Global font cache to prevent reloading the same fonts
const loadedFonts = new Set<string>();

export const useFontLoader = (fontFamilies: string[] = []) => {
  const [isLoading, setIsLoading] = useState(fontFamilies.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loadedFontDetails, setLoadedFontDetails] = useState<Font[]>([]);

  useEffect(() => {
    if (fontFamilies.length === 0) {
      setIsLoading(false);
      return;
    }

    // Check if Supabase is properly configured
    if (!supabase) {
      console.warn('Supabase not configured - missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
      setError('Font loading service not configured');
      setIsLoading(false);
      return;
    }

    // Filter out already loaded fonts
    const fontsToLoad = fontFamilies.filter(font => !loadedFonts.has(font));
    
    if (fontsToLoad.length === 0) {
      setIsLoading(false);
      return;
    }

    const loadFonts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch font details from database
        const { data: fonts, error } = await supabase
          .from('fonts')
          .select('*')
          .in('name', fontsToLoad);
        
        if (error) throw error;
        
        if (!fonts || fonts.length === 0) {
          console.warn('No font details found for:', fontsToLoad);
          setIsLoading(false);
          return;
        }

        let loadedCount = 0;
        // Create style elements for each font
        const fontPromises = fonts.map(async (font: Font) => {
          try {
            // Create a new style element
            const style = document.createElement('style');
            style.textContent = `
              @font-face {
                font-family: '${font.name}';
                src: url('${font.url}') format('${font.type === 'ttf' ? 'truetype' : 
                                              font.type === 'otf' ? 'opentype' : 
                                              font.type}');
                font-display: swap;
              }
            `;
            document.head.appendChild(style);
            
            // Mark this font as loaded
            loadedFonts.add(font.name);
            loadedCount++;
            // Update progress
            setProgress(Math.round((loadedCount / fonts.length) * 100));
            
            return font;
          } catch (err) {
            console.error(`Error loading font ${font.name}:`, err);
            return null;
          }
        });
        
        const resolvedFonts = await Promise.all(fontPromises);
        console.log('Fonts loaded:', resolvedFonts.length);
        setLoadedFontDetails(resolvedFonts.filter(Boolean) as Font[]);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading fonts:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading fonts');
        setIsLoading(false);
      }
    };
    
    loadFonts();
  }, [fontFamilies]);

  return { isLoading, error, loadedFontDetails, progress };
};