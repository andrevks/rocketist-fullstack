"use client";

import { useState } from "react";
import { Header } from "@/components/Header/Header";
import { NewTask } from "@/components/NewTask/NewTask";
import { TaskList } from "@/components/TaskList/TaskList";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import styles from "./page.module.css";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <Header />
      <LanguageSwitcher />
      <main className={styles.wrapper}>
        <NewTask onTaskCreated={handleTaskCreated} />
        <TaskList refreshTrigger={refreshKey} />
      </main>
    </div>
  );
}
