'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Use next-intl's router to navigate with locale
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={styles.switcher}>
      <button
        onClick={() => switchLocale('en')}
        className={locale === 'en' ? styles.active : ''}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('pt-BR')}
        className={locale === 'pt-BR' ? styles.active : ''}
        aria-label="Switch to Portuguese"
      >
        PT
      </button>
    </div>
  );
}

