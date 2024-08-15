import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'; // Import arrow icons
import styles from '../styles/automations.module.css';
import Header from '../components/Header';

function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSortedByLastRun, setIsSortedByLastRun] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State to track the search term

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const response = await axios.get('/api/automations');
        setAutomations(response.data);
      } catch (err) {
        console.error('Failed to fetch automations:', err);
        setError('Failed to fetch automations');
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);

  const sortAutomationsByLastRun = () => {
    const sortedAutomations = [...automations].sort((a, b) => {
      const dateA = new Date(a.lastRunTime);
      const dateB = new Date(b.lastRunTime);
      return isSortedByLastRun ? dateA - dateB : dateB - dateA;
    });

    setIsSortedByLastRun(!isSortedByLastRun);
    setAutomations(sortedAutomations);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAutomations = automations.filter(auto =>
    auto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAutomations = () => {
    return filteredAutomations.map((auto, index) => (
      <div key={index} className={styles.automationItem}>
        <strong className={styles.automationName}>⚙️ {auto.name}</strong>
        <div className={styles.automationDetail}>📅 Last Run Time: {auto.lastRunTime ? new Date(auto.lastRunTime).toLocaleString() : 'Unknown'}</div>
        <div className={styles.automationDetail}>🔑 Data Extension Keys: 
          {auto.targetDataExtensions && auto.targetDataExtensions.length > 0 
            ? auto.targetDataExtensions.map(de => <span key={de.id} className={styles.dataExtensionKey}>{de.key}; </span>)
            : 'None'}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.automationsContainer}>
      <Header />
      <h2 className={styles.automationsHeader}>B2B SFMC Automations</h2>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search Automations..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <button onClick={sortAutomationsByLastRun} className={styles.sortButton}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Sort by: {isSortedByLastRun ? 'Earliest' : 'Latest'} 
            {isSortedByLastRun ? <FaArrowUp style={{ marginLeft: '5px' }} /> : <FaArrowDown style={{ marginLeft: '5px' }} />}
          </span>
        </button>
      </div>

      {loading && <div className={styles.loadingSpinner}>Loading...</div>}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      {!loading && renderAutomations()}
    </div>
  );
}

export default Automations;
