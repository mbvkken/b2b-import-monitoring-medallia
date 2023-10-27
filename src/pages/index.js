import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/home.module.css';

const sentNotifications = new Set();

async function notifySlack(message, dataExtensionName) {
  const notificationKey = `${dataExtensionName}:${message}`;

  if (sentNotifications.has(notificationKey)) {
    console.log('Notification already sent:', message);
    return;
  }

  try {
    await axios.post('/api/sendToSlack', { text: message });
    console.log('Slack notification sent:', message);
    sentNotifications.add(notificationKey);
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

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

          if (dataExtension.name === 'medallia_rnps_end_user_import_url' && dataExtension.items.length < 1001) {
            const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
            const vercelURL = 'https://sfmc-app-monitoring.vercel.app/';
            const message = `Check status <${vercelURL}|here>: On latest import the Data Extension "${dataExtension.name}" has ${dataExtension.items.length} records which is less than the expected 1000 records. This could be correct, but maybe worth checking out? Head over to <${adminPanelURL}|Automation Studio>`;
            notifySlack(message, dataExtension.name);
          }

          const invalidURLs = dataExtension.items.filter(item => !isValidURL(item.values.survey_url)).length;
          if (invalidURLs > 0) {
            const vercelURL = 'https://sfmc-app-monitoring.vercel.app/';
            const message = `Check status <${vercelURL}|here>: ${invalidURLs} or more invalid URLs detected in "${dataExtension.name}"`;
            notifySlack(message, dataExtension.name);
          }

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
              <th>Data Extension Name</th>
              <th>Number of Records</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(dataExtensions).length > 0 ? (
              Object.values(dataExtensions).map((data) => (
                <tr key={data.key}>
                  <td>{data.name}</td>
                  <td>{data.items.length}</td>
                  <td>{renderStatus(data)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No Data Extensions Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
