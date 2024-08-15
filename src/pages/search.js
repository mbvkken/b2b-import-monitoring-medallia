import React, { useState, useEffect } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'; // Import arrow icons
import styles from '../styles/search.module.css';
import axios from 'axios';
import Header from '../components/Header';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortByCreatedDate, setSortByCreatedDate] = useState(true);

  useEffect(() => {
    // Define the function to fetch all journeys
    const fetchAllJourneys = async () => {
      setLoading(true);
      setError(null);

      try {
        // Make a GET request to the API route for fetching all journeys
        const response = await axios.get('/api/get-all-journeys');

        // Handle the response and update the state with all journeys
        setJourneys(response.data);
        console.log('Journey objects:', response.data);
      } catch (error) {
        console.error('Failed to fetch journeys:', error);
        setError('Failed to fetch journeys');
      } finally {
        setLoading(false);
      }
    };

    // Call fetchAllJourneys when the component mounts
    fetchAllJourneys();
  }, []);

  // Sort journeys by created date
  const sortedJourneys = [...journeys].sort((a, b) => {
    if (sortByCreatedDate) {
      return new Date(b.createdDate) - new Date(a.createdDate);
    } else {
      return new Date(a.createdDate) - new Date(b.createdDate);
    }
  });

  // Toggle the sorting order
  const toggleSortOrder = () => {
    setSortByCreatedDate(!sortByCreatedDate);
  };

  // Function to get the emoji based on journey status
  const getStatusEmoji = (status) => {
    return status === 'Published' ? '✅' : '❌';
  };

  // Filter journeys based on the search query
  const filteredJourneys = sortedJourneys.filter((journey) =>
    journey.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />
      <h1 className={styles.h1}>B2B Journeys</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Search Journeys"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.sortButtonContainer}>
        <button onClick={toggleSortOrder} className={styles.sortButton}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Sort by Created Date: {sortByCreatedDate ? 'Latest' : 'Earliest'}
            {sortByCreatedDate ? (
              <FaArrowDown style={{ marginLeft: '5px' }} />
            ) : (
              <FaArrowUp style={{ marginLeft: '5px' }} />
            )}
          </span>
        </button>
      </div>
      {loading && (
        <div className={styles.loadingSpinner}>Loading...</div>
      )}
      {error && <p className={styles.errorMessage}>Error: {error}</p>}
      <ul className={styles.results}>
        {filteredJourneys.length > 0 ? (
          filteredJourneys.map((journey, index) => (
            <li key={index} className={styles.resultsItem}>
              <strong>{index + 1}.</strong> <span className={styles.journeyName}>{journey.name}</span>
              <div className={styles.journeyDetails}>
                <span>{getStatusEmoji(journey.status)} Status: {journey.status}</span>
              </div>
              <div className={styles.journeyDetails}>
                <span>⚙️ Version: {journey.version}</span>
              </div>
              <div className={styles.journeyDetails}>
                <span>📅 Created Date: {journey.createdDate}</span>
              </div>
              <div className={styles.journeyDetails}>
                <span>🆔 ID: {journey.id}</span>
              </div>
            </li>
          ))
        ) : (
          <li className={styles.resultsItem}>No matching journeys found.</li>
        )}
      </ul>
    </div>
  );
};

export default Search;
