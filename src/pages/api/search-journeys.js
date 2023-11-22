import { searchJourneys, getAccessToken } from '../../lib/salesforceBulkREST';

export default async (req, res) => {
    try {
        // Retrieve the search query from the request body
        const { query } = req.body;

        // Get the access token
        const token = await getAccessToken();

        // Validate and sanitize the query if necessary

        // Perform the search operation using the searchJourneys function
        const searchResults = await searchJourneys(query, token);

        // Send the search results as JSON
        res.status(200).json(searchResults);
    } catch (error) {
        console.error('Error searching journeys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
