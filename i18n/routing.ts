import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'pt-BR'],

  // Used when no locale matches
  // Default is English, but will auto-detect pt-BR for Brazilian users
  defaultLocale: 'en',

  // Locale detection based on Accept-Language header
  // Middleware will detect Brazil users and set pt-BR
  localeDetection: true,
  
  // Omit locale prefix for default locale (English)
  localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

