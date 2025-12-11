"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Trash } from "phosphor-react";
import styles from "./Task.module.css";
import { Task as TaskType } from "@/lib/types";

interface TaskProps {
  task: TaskType;
  onTaskUpdated: () => void;
}

function normalizeStep(step: unknown): string {
  if (typeof step === "string") {
    return step;
  }

  if (typeof step === "object" && step !== null) {
    const candidate = step as { text?: string; order?: number };
    if (candidate.text) {
      return candidate.text;
    }
  }

  return String(step ?? "");
}

export function Task({ task, onTaskUpdated }: TaskProps) {
  const t = useTranslations('tasks');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleDone() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: task.status === "done" ? "pending" : "done",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      onTaskUpdated();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateTitle() {
    if (editTitle.trim() === task.title) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      console.error("Error updating task:", error);
      alert(t('updateError'));
      setEditTitle(task.title);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateDescription() {
    const newDescription = editDescription.trim() || null;
    if (newDescription === (task.description || null)) {
      setIsEditingDescription(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: newDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setIsEditingDescription(false);
      onTaskUpdated();
    } catch (error) {
      console.error("Error updating task:", error);
      alert(t('updateError'));
      setEditDescription(task.description || "");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteTask() {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      onTaskUpdated();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(t('deleteError'));
    } finally {
      setIsLoading(false);
    }
  }

  // Update local state when task changes
  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  }, [task.title, task.description]);

  const isDone = task.status === "done";

  return (
    <article className={`${styles.task} ${isDone ? styles.taskDone : styles.taskNotDone}`}>
      <label className={styles.circle}>
        <input
          type="checkbox"
          checked={isDone}
          onChange={handleToggleDone}
          disabled={isLoading}
        />
        <span className={styles.checkmark}></span>
      </label>
      <div className={styles.taskBody}>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateTitle();
              } else if (e.key === "Escape") {
                setEditTitle(task.title);
                setIsEditing(false);
              }
            }}
            className={styles.editInput}
            autoFocus
            disabled={isLoading}
          />
        ) : (
          <p
            className={isDone ? styles.descriptionTaskDone : styles.description}
            onDoubleClick={() => setIsEditing(true)}
            role="textbox"
            aria-label="Task title"
          >
            {task.title}
          </p>
        )}

        {task.needs_enrichment && (
          <span className={styles.enrichmentBadge}>{t('enrichmentPending')}</span>
        )}

        {isEditingDescription ? (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onBlur={handleUpdateDescription}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleUpdateDescription();
              } else if (e.key === "Escape") {
                setEditDescription(task.description || "");
                setIsEditingDescription(false);
              }
            }}
            className={styles.editDescriptionInput}
            placeholder="Add a description..."
            autoFocus
            disabled={isLoading}
            rows={2}
          />
        ) : (
          <p
            className={isDone ? styles.descriptionTextDone : styles.descriptionText}
            onDoubleClick={() => setIsEditingDescription(true)}
            role="textbox"
            aria-label="Task description"
          >
            {task.description || (
              <span className={styles.descriptionPlaceholder}>{t('descriptionPlaceholder')}</span>
            )}
          </p>
        )}

        {task.description && (task.steps || task.extra_info) && (
          <details className={styles.aiDetails}>
            <summary className={styles.aiSummary}>{t('aiDetails')}</summary>
            <div className={styles.aiContent}>
              {task.steps && task.steps.length > 0 && (
                <div className={styles.steps}>
                  <strong>{t('steps')}:</strong>
                  <ol>
                    {task.steps.map((step, idx) => (
                      <li key={idx}>{normalizeStep(step)}</li>
                    ))}
                  </ol>
                </div>
              )}
              {task.extra_info && (
                <div className={styles.extraInfo}>
                  <strong>{t('extraInfo')}:</strong>
                  {task.extra_info.links && Array.isArray(task.extra_info.links) && task.extra_info.links.length > 0 && (
                    <div className={styles.extraInfoLinks}>
                      <strong className={styles.extraInfoLabel}>{t('links')}:</strong>
                      {task.extra_info.links.map((link: string, idx: number) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.extraInfoLink}
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  )}
                  {task.extra_info.notes && (
                    <div className={styles.extraInfoNotes}>
                      <strong className={styles.extraInfoLabel}>{t('notes')}:</strong>
                      <div>{task.extra_info.notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </details>
        )}
      </div>
      <button className={styles.trash} onClick={handleDeleteTask} disabled={isLoading}>
        <Trash size={18} weight={"bold"} />
      </button>
    </article>
  );
}
