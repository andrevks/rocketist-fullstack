import Image from 'next/image';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Image 
        src="/assets/todo-logo.svg" 
        alt="Logo Todo" 
        width={22}
        height={36}
      />
      <div>
        <span className={styles.prefix}>to</span>
        <span className={styles.suffix}>do</span>
      </div>
    </header>
  );
}

