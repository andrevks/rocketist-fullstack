'use client';

import { useTranslations } from 'next-intl';
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  value: number;
  isRefreshing?: boolean;
}

export function ProgressBar({ value, isRefreshing }: ProgressBarProps) {
  const t = useTranslations('tasks');
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>{t('progress')}</span>
        <span>{safeValue}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${safeValue}%` }}
          aria-valuenow={safeValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {isRefreshing && <p className={styles.caption}>{t('syncing')}</p>}
    </div>
  );
}
