import { getBulkDataExtensionDetails } from '../../lib/salesforceBulkREST';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Parse Data Extension keys from the environment variable
      const deKeys = process.env.MC_DE_KEYS ? process.env.MC_DE_KEYS.split(',') : [];
      
      // If no Data Extension keys are found, return an error
      if (deKeys.length === 0) {
        return res.status(400).json({ error: 'No Data Extension keys found in environment variables' });
      }

      // Fetch Data Extension details
      const dataExtensions = await getBulkDataExtensionDetails(deKeys);
      if (!dataExtensions) {
        return res.status(500).json({ error: 'Failed to fetch data extensions' });
      }
      return res.status(200).json(dataExtensions);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}
