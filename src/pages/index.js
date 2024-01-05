import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Data Extensions
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

        // Fetch Automations
        const automationResponse = await axios.get('/api/automations');
        setAutomations(automationResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStatus = (data) => {
    const invalidURLs = data.items.filter(item => !isValidURL(item.survey_url)).length;
    return invalidURLs > 0 
      ? <span style={{ color: 'red' }}>❌ Invalid URLs Detected</span>
      : <span style={{ color: 'green' }}>✅ All URLs valid</span>;
  };

  const renderAutomations = () => {
    return automations.map((auto, index) => {
      // Log the entire automation object for inspection
      console.log('Automation Object:', auto);
  
      // Existing rendering logic...
      return (
        <div style={{ color: 'black' }} key={index}>
          <strong>{auto.name}</strong>
          <div>Last Run Time: {auto.lastRunTime ? new Date(auto.lastRunTime).toLocaleString() : 'Unknown'}</div>
          <div>Data Extension Keys: 
            {auto.targetDataExtensions && auto.targetDataExtensions.length > 0 
              ? auto.targetDataExtensions.map(de => <span key={de.id}>{de.key}; </span>)
              : 'None'}
          </div>
        </div>
      );
    });
  };
  
  

  return (
    <div className={styles.container}>
      <Header />
      <h1 className={styles.h1}>B2B Medallia Import Monitoring</h1>
      {loading && <div className={styles.loadingSpinner}>Loading...</div>}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      {/* Data Extensions Section */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Data Extensions</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(dataExtensions).length > 0 ? (
              Object.values(dataExtensions).map((data, index) => (
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
                <td>No Data Extensions Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Automations Section */}
      <div>
        <h2 style={{ color: 'black', fontSize:'30px' }}>Automations</h2>
        {renderAutomations()}
      </div>
    </div>
  );
}