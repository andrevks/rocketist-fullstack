import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // If no locale is provided, try to detect from headers
  if (!locale) {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    
    // Check for Brazil geo-location (Vercel/Cloudflare headers)
    const country = headersList.get('x-vercel-ip-country') || 
                    headersList.get('cf-ipcountry') || 
                    '';
    
    // If user is in Brazil, default to pt-BR
    if (country === 'BR') {
      locale = 'pt-BR';
    } 
    // Check Accept-Language header for Portuguese
    else if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
      locale = 'pt-BR';
    } 
    // Default to English
    else {
      locale = routing.defaultLocale;
    }
  }

  // Ensure that the incoming `locale` is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Use conditional imports for Next.js static analysis
  let messages;
  if (locale === 'pt-BR') {
    messages = (await import('../messages/pt-BR.json')).default;
  } else {
    messages = (await import('../messages/en.json')).default;
  }

  return {
    locale,
    messages
  };
});

