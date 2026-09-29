import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import api from '../api/axios';
import defaultTheme, { getThemeOptions } from '../theme';

export interface SiteSettings {
  site_title: string;
  logo: string | null;
  favicon: string | null;
  login_image: string | null;
  login_welcome_title: string;
  login_welcome_subtitle: string;
  primary_color: string;
  accent_color: string;
  font_family: string;
  base_font_size: number;
  sidebar_style: string;
  theme_mode: 'light' | 'dark' | 'system';
  custom_css: string;
}

export const AppearanceContext = createContext<{ settings: SiteSettings | null }>({ settings: null });

export const AppearanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    api.get('appearance/settings/')
      .then(res => {
        const data = res.data;
        
        const getFullMediaUrl = (url: string | null) => {
          if (!url) return null;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          const cleanPath = url.startsWith('/') ? url : `/${url}`;
          return `http://localhost:8000${cleanPath}`;
        };

        const normalizedSettings: SiteSettings = {
          ...data,
          logo: getFullMediaUrl(data.logo),
          favicon: getFullMediaUrl(data.favicon),
          login_image: getFullMediaUrl(data.login_image),
        };

        setSettings(normalizedSettings);

        // Update document title
        if (normalizedSettings.site_title) {
          document.title = normalizedSettings.site_title;
        }

        // Update favicon
        if (normalizedSettings.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = normalizedSettings.favicon;
        }

        // Dynamic Font Loading
        if (data.font_family && !data.font_family.includes('Roboto') && !data.font_family.includes('Plus Jakarta Sans')) {
          const mainFont = data.font_family.split(',')[0].replace(/['"]/g, '').trim();
          if (mainFont) {
            const fontUrl = `https://fonts.googleapis.com/css2?family=${mainFont.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
            let fontLink = document.getElementById('dynamic-font') as HTMLLinkElement;
            if (!fontLink) {
              fontLink = document.createElement('link');
              fontLink.id = 'dynamic-font';
              fontLink.rel = 'stylesheet';
              document.head.appendChild(fontLink);
            }
            fontLink.href = fontUrl;
          }
        }

        // Create dynamic theme using a fresh options object to prevent MUI mutation bugs
        const freshOptions = getThemeOptions(data.primary_color, data.accent_color);
        const newTheme = createTheme({
          ...freshOptions,
          typography: {
            ...freshOptions.typography,
            fontFamily: data.font_family || freshOptions.typography.fontFamily,
            htmlFontSize: data.base_font_size || 16,
          }
        });
        setCurrentTheme(newTheme);
      })
      .catch(err => console.error('Failed to load appearance settings', err));
  }, []);

  return (
    <AppearanceContext.Provider value={{ settings }}>
      <ThemeProvider theme={currentTheme}>
        {settings?.custom_css && <style>{settings.custom_css}</style>}
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
};
