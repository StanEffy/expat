import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'Expat App',
  noindex = false,
  structuredData,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ogImage = image || (baseUrl ? `${baseUrl}/android-chrome-512x512.png` : '/android-chrome-512x512.png');

  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Remove existing meta tags
    const removeMetaTag = (attribute: string, value: string) => {
      const existing = document.querySelector(`meta[${attribute}="${value}"]`);
      if (existing) {
        existing.remove();
      }
    };

    // Helper to set or update meta tag
    const setMetaTag = (attribute: string, value: string, content: string) => {
      removeMetaTag(attribute, value);
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, value);
      meta.content = content;
      document.head.appendChild(meta);
    };

    // Basic meta tags
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // Language
    setMetaTag('property', 'og:locale', currentLang);
    document.documentElement.lang = currentLang;

    // Open Graph tags
    setMetaTag('property', 'og:title', title || siteName);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', siteName);

    // Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || siteName);
    if (description) {
      setMetaTag('name', 'twitter:description', description);
    }
    setMetaTag('name', 'twitter:image', ogImage);

    // Robots
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Canonical URL
    const removeCanonical = () => {
      const existing = document.querySelector('link[rel="canonical"]');
      if (existing) {
        existing.remove();
      }
    };
    removeCanonical();
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = currentUrl;
    document.head.appendChild(canonical);

    // Viewport (ensure it exists)
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewport);
    }

    // Structured data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Remove undefined values from structured data
      const cleanStructuredData = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return undefined;
        }
        if (Array.isArray(obj)) {
          return obj.map(cleanStructuredData).filter(item => item !== undefined);
        }
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            const cleanedValue = cleanStructuredData(obj[key]);
            if (cleanedValue !== undefined) {
              cleaned[key] = cleanedValue;
            }
          }
          return Object.keys(cleaned).length > 0 ? cleaned : undefined;
        }
        return obj;
      };

      const cleanedData = cleanStructuredData(structuredData);
      if (cleanedData && Object.keys(cleanedData).length > 0) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(cleanedData);
        document.head.appendChild(script);
      }
    }

    // Cleanup function
    return () => {
      // Note: We don't remove all meta tags on cleanup to avoid flickering
      // The component will update them on re-render
    };
  }, [title, description, keywords, image, url, type, siteName, noindex, structuredData, currentLang, ogImage, currentUrl]);

  return null;
};

export default SEO;

