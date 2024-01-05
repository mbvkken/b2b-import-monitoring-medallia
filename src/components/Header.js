// components/Header.js

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
            <a className={styles.button}><FaHome /></a> {/* Updated to include 'a' tag */}
          </Link>
          <Link href="/search">
            <a className={styles.button}><FaSearch /></a> {/* Updated to include 'a' tag */}
          </Link>
          <Link href="/automations">
            <a className={styles.button}><FaCogs /></a> {/* New link for Automations */}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
