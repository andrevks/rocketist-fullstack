'use client';

import { useTranslations } from 'next-intl';
import styles from './TaskListInfo.module.css';

interface TaskListInfoProps {
  qtyTaskCreated: number;
  qtyTaskDone: number;
}

export function TaskListInfo({ qtyTaskCreated, qtyTaskDone }: TaskListInfoProps) {
  const t = useTranslations('tasks');
  
  return (
    <div className={styles.taskListInfo}>
      <strong className={styles.taskCreatedCount}>
        {t('created')}
        <span>{qtyTaskCreated}</span>
      </strong>

      <strong className={styles.taskDoneCount}>
        {t('completed')}
        <span>
          {qtyTaskDone} {qtyTaskCreated ? `${t('completedOf')} ${qtyTaskCreated}` : ''}
        </span>
      </strong>
    </div>
  );
}

