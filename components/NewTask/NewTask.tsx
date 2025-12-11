'use client';

import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { PlusCircle } from 'phosphor-react';
import styles from './NewTask.module.css';

interface NewTaskProps {
  onTaskCreated: () => void;
}

export function NewTask({ onTaskCreated }: NewTaskProps) {
  const t = useTranslations('tasks');
  const tCommon = useTranslations('common');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function createTask(title: string) {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      setNewTaskTitle('');
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(t('createError'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleChangeInput(e: ChangeEvent<HTMLInputElement>): void {
    const taskTitle = e.target.value;
    setNewTaskTitle(taskTitle);
  }

  function handleOnClickChange(): void {
    createTask(newTaskTitle);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && !isLoading) {
      createTask(newTaskTitle);
    }
  }

  return (
    <div className={styles.newTask}>
      <input
        onChange={handleChangeInput}
        onKeyDown={handleKeyDown}
        value={newTaskTitle}
        placeholder={t('addNew')}
        maxLength={250}
        disabled={isLoading}
      />
      <button onClick={handleOnClickChange} disabled={isLoading}>
        {tCommon('create')}
        <PlusCircle size={18} weight={'bold'} />
      </button>
    </div>
  );
}

