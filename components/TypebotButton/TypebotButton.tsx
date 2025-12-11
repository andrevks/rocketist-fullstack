"use client";

import { useRouter } from "next/navigation";
import styles from "./TypebotButton.module.css";

export function TypebotButton() {
  const router = useRouter();

  const handleClick = () => {
    const typebotUrl = process.env.NEXT_PUBLIC_TYPEBOT_URL;
    if (typebotUrl) {
      router.push(typebotUrl);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={handleClick} className={styles.button}>
        💬 Chat with AI Assistant
      </button>
    </div>
  );
}