// pages/api/get-all-journeys.js

import { searchJourneys, getAccessToken } from '../../lib/salesforceBulkREST';

export default async (req, res) => {
    try {
        // Get the access token
        const token = await getAccessToken();

        // Call the searchJourneys function with an empty query to fetch all journeys
        const searchResults = await searchJourneys('', token);

        // Send the search results as JSON
        res.status(200).json(searchResults);
    } catch (error) {
        console.error('Error fetching all journeys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
