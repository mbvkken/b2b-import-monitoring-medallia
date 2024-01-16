import Link from 'next/link';
import { FaHome, FaSearch, FaCogs } from 'react-icons/fa'; // Assuming FaCogs is the icon for Automations
import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.container}>    
      <div className={styles.title}>Telia SFMC B2B</div>
    <div className={styles.buttonContainer}>
      <Link href="/">
        <span className={styles.button}>
          <FaHome />
          <span className={styles.buttonLabel}>Data Extensions</span>
        </span>
      </Link>
      <Link href="/search">
        <span className={styles.button}>
          <FaSearch />
          <span className={styles.buttonLabel}>Journeys</span>
        </span>
      </Link>
      <Link href="/automations">
        <span className={styles.button}>
          <FaCogs />
          <span className={styles.buttonLabel}>Automations</span>
        </span>
      </Link>
    </div>
  </div>
</div>
);
};

export default Header;