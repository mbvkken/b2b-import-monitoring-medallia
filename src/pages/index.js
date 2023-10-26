import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/home.module.css';

async function notifySlack(message) {
  try {
    await axios.post('/api/sendToSlack', {
      text: message
    });
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
  const [data, setData] = useState(null);
  const [dataExtensionName, setDataExtensionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;

  async function fetchDataExtension() {
    // Reset states
    setData(null);
    setDataExtensionName("");
    setError(null);
    setLoading(true);
  
    try {
      const response = await axios.get('/api/data-extension?id=YOUR_DATA_EXTENSION_ID');
      const fetchedData = response.data;

      // Set the Data Extension Name
      setDataExtensionName(fetchedData.name);
  
      // Check the total number of records
      if (fetchedData.items.length < 100) {
        const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
        const message = `On latest import the Data Extension "${fetchedData.name}" has ${fetchedData.items.length} records which is less than the expected 100 records. This could be correct, but maybe worth checking out? Head over to <${adminPanelURL}|Automation Studio> `;
        setError(message);
        notifySlack(message);
      }
  
      // Check if survey_url is valid for each item
      let invalidURLs = 0;
      for (const item of fetchedData.items) {
        if (!isValidURL(item.values.survey_url)) {
          invalidURLs++;
        }
      }
      if (invalidURLs > 0) {
        const message = `${invalidURLs} or more invalid URLs detected in "${fetchedData.name}"`;
        setError(message);
        notifySlack(message);
      }
  
      setData(fetchedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = data?.items?.slice(firstIndex, lastIndex);

    /* return (
     <div className={styles.container}>
      <button className={styles.fetchButton} onClick={fetchDataExtension}>Fetch Data Extension</button>
      
      {dataExtensionName && <p className={`${styles.textDark}`}>Data Extension Name: {dataExtensionName}</p>}
      {loading && <p>Loading...</p>}
      {error && <p className={`${styles.errorMessage} ${styles.textDark}`}>Error occurred: {error}</p>}
      
      {currentRecords && (
        <div className={styles.dataSection}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Contact ID</th>
                <th>Survey ID</th>
                <th>Survey URL</th>
                <th>Created Date</th>
                <th>Email</th>
                <th>Mobile Phone</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((item, index) => (
                <tr key={index}>
                  <td>{item.values.contact_id}</td>
                  <td>{item.values.surveyid}</td>
                  <td>{item.values.survey_url}</td>
                  <td>{item.values.created_on}</td>
                  <td>{item.values.email}</td>
                  <td>{item.values.mobile_phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  ); */

  
  return (
    <div>
      Backend process running.
    </div>
  );
  
}
