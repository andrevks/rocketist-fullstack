import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Root page redirects to default locale or detected locale
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}

