// components/Header.js

import Link from 'next/link';
import { FaHome, FaSearch } from 'react-icons/fa'; // Import Font Awesome icons
import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.title}>SFMC Toolbox</div>
        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.button}>
            <FaHome /> {/* Replace "Home" with the home icon */}
          </Link>
          <Link href="/search" className={styles.button}>
            <FaSearch /> {/* Replace "Search" with the search icon */}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
