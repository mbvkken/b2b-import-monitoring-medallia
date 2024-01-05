import { listAutomations, fetchAutomationDetails, getAccessToken } from '../../lib/salesforceBulkREST';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get the access token
      const token = await getAccessToken();
      if (!token) {
        return res.status(401).json({ error: 'Failed to authenticate with Salesforce Marketing Cloud' });
      }

      // Fetch the list of automations
      const automationsList = await listAutomations(token);
      if (!automationsList) {
        return res.status(500).json({ error: 'Failed to fetch automations' });
      }

      // Fetch details for each automation
      const automationsDetails = await Promise.all(
        automationsList.map(automation => fetchAutomationDetails(automation.id, token))
      );

      return res.status(200).json(automationsDetails);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}
