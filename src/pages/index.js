import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/home.module.css';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataExtensions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/data-extensions');
        const fetchedData = response.data;
        console.log('Fetched Data Extensions:', fetchedData);

        const deData = {};
        fetchedData.forEach((dataExtension) => {
          const deKey = dataExtension.key;
          console.log(`Data Extension: ${dataExtension.name}`, dataExtension);

          deData[deKey] = { ...dataExtension, items: dataExtension.items.map(item => item.values) };
        });

        console.log('Structured Data Extensions:', deData);
        setDataExtensions(deData);
      } catch (err) {
        console.error('Failed to fetch data extensions:', err);
        setError('Failed to fetch data extensions');
      } finally {
        setLoading(false);
      }
    };

    fetchDataExtensions();
  }, []);

  const renderStatus = (data) => {
    const invalidURLs = data.items.filter(item => !isValidURL(item.survey_url)).length;
    if (invalidURLs > 0) {
      return <span style={{ color: 'red' }}>❌ Invalid URLs Detected</span>;
    }
    return <span style={{ color: 'green' }}>✅ All URLs Valid</span>;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Medallia Import Monitoring</h1>
      {loading && <div className={styles.loadingSpinner}>Loading...</div>}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
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
                      <div className={styles.bold}>{index + 1}. {data.name}</div>
                      <div>{data.items.length} Record(s)</div>
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
    </div>
  );
}
