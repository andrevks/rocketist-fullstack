"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "./TaskList.module.css";
import { Task } from "../Task/Task";
import { TaskListInfo } from "../TaskListInfo/TaskListInfo";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Task as TaskType } from "@/lib/types";

interface TaskListProps {
  refreshTrigger: number;
}

export function TaskList({ refreshTrigger }: TaskListProps) {
  const t = useTranslations('tasks');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/tasks", { cache: "no-store" });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch tasks:", response.status, errorText);
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Fetched ${data?.length || 0} tasks from API`);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]); // Set empty array on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  // Connect to SSE stream for real-time updates via API (no direct DB connection)
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      // Connect to our API SSE endpoint
      eventSource = new EventSource("/api/tasks/stream");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "task_updated") {
            console.log("✅ Task updated via API stream:", data);
            // Refresh tasks when we get an update
            fetchTasks();
          } else if (data.type === "connected") {
            console.log("✅ Connected to task update stream");
          } else if (data.type === "ping") {
            // Keep-alive ping, ignore
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE stream error:", error);
        // Auto-reconnect is handled by EventSource
      };

      // Cleanup on unmount
      return () => {
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch (error) {
      console.error("Failed to set up SSE stream:", error);
      // Fallback to polling if SSE fails
      const pollInterval = setInterval(() => {
        fetchTasks();
      }, 5000); // Poll every 5 seconds as fallback

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [fetchTasks]);

  const qtyTaskCreated = tasks.length || 0;
  const qtyTaskDone = tasks.filter((task) => task.status === "done").length || 0;

  const completionPercentage = useMemo(() => {
    if (qtyTaskCreated === 0) {
      return 0;
    }
    return Math.round((qtyTaskDone / qtyTaskCreated) * 100);
  }, [qtyTaskCreated, qtyTaskDone]);

  if (isLoading) {
    return (
      <div className={styles.taskListContainer}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.taskListContainer}>
      <TaskListInfo qtyTaskCreated={qtyTaskCreated} qtyTaskDone={qtyTaskDone} />
      <ProgressBar value={completionPercentage} isRefreshing={isRefreshing} />

      {qtyTaskCreated > 0 ? (
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <Task key={task.id} task={task} onTaskUpdated={fetchTasks} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyTaskList}>
          <Image
            src="/assets/clipboard.svg"
            alt="Clipboard Icon"
            width={56}
            height={56}
          />
          <div>
            <p className={styles.boldDescription}>
              {t('empty.title')}
            </p>
            <p>{t('empty.description')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
