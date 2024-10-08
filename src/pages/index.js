import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import styles from '../styles/home.module.css';
import Header from '../components/Header';

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default function Home() {
  const [dataExtensions, setDataExtensions] = useState({});
  const [automationDetails, setAutomationDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const deResponse = await axios.get('/api/data-extensions');
        const fetchedDEData = deResponse.data;

        const deData = {};
        fetchedDEData.forEach((dataExtension) => {
          const deKey = dataExtension.key;
          deData[deKey] = {
            ...dataExtension,
            items: dataExtension.items && Array.isArray(dataExtension.items) 
                   ? dataExtension.items.map(item => item.values) 
                   : []
          };
        });

        setDataExtensions(deData);

        const automationResponse = await axios.get('/api/automations');
        const fetchedAutomationDetails = automationResponse.data;

        setAutomationDetails(fetchedAutomationDetails);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLastRunTime = (data, automationDetail) => {
    if (Array.isArray(automationDetail)) {
      const automation = automationDetail.find(automation => {
        return (
          automation.steps &&
          automation.steps.some(step =>
            step.activities &&
            step.activities.some(activity =>
              activity.targetDataExtensions &&
              activity.targetDataExtensions.some(extension => extension.key === data.key)
            )
          )
        );
      });

      if (automation) {
        const rawLastRunTime = new Date(automation.lastRunTime);
        rawLastRunTime.setHours(rawLastRunTime.getHours() + 8); // Add 8 hours for Norwegian timezone
        return rawLastRunTime;
      }
    }

    return null;
  };

  const sortDataExtensionsByDate = () => {
    const sortedDataExtensions = Object.values(dataExtensions).slice().sort((a, b) => {
      const aLastRunTime = getLastRunTime(a, automationDetails);
      const bLastRunTime = getLastRunTime(b, automationDetails);

      if (aLastRunTime && bLastRunTime) {
        return sortByDateAsc 
          ? aLastRunTime - bLastRunTime 
          : bLastRunTime - aLastRunTime;
      }
      return 0;
    });

    const sortedDataExtensionsObj = sortedDataExtensions.reduce((acc, de) => {
      acc[de.key] = de;
      return acc;
    }, {});

    setDataExtensions(sortedDataExtensionsObj);
    setSortByDateAsc(!sortByDateAsc);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDataExtensions = Object.values(dataExtensions).filter(de => 
    de.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatus = (data) => {
    const invalidURLs = data.items.filter(item => !isValidURL(item.survey_url)).length;
    const lastRunTime = getLastRunTime(data, automationDetails);

    return (
      <div>
        {invalidURLs > 0 ? (
          <span style={{ color: 'red' }}>❌ Invalid URLs Detected</span>
        ) : (
          <span style={{ color: 'green' }}>✅ All URLs valid</span>
        )}
        <div>📅 Last Import: {lastRunTime ? lastRunTime.toLocaleString('no-NO', { timeZone: 'Europe/Oslo' }) : 'N/A'}</div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Header />
      <h1 className={styles.h1}>B2B Medallia Data Extensions Monitoring</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search Data Extensions..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <button onClick={sortDataExtensionsByDate} className={styles.sortButton}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Sort by: {sortByDateAsc ? 'Earliest' : 'Latest'} 
            {sortByDateAsc ? <FaArrowUp style={{ marginLeft: '5px' }} /> : <FaArrowDown style={{ marginLeft: '5px' }} />}
          </span>
        </button>
      </div>


      {loading && <div className={styles.loadingSpinner}>Loading...</div>}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Data Extension details</th>
            </tr>
          </thead>
          <tbody>
            {filteredDataExtensions.length > 0 ? (
              filteredDataExtensions.map((data, index) => (
                <tr key={data.key}>
                  <td>
                    <div className={styles.dataExtension}>
                      <div className={styles.bold}>🏷️ {index + 1}. {data.name}</div>
                      <div>💿 {data.items.length} Record(s)</div>
                      <div>{renderStatus(data)}</div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No Data Extension(s) Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
