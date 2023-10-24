import { fetchDataExtensionName } from '../../lib/salesforceREST';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const dataExtensionId = req.query.id;

    if (!dataExtensionId) {
      return res.status(400).json({ error: 'Data Extension ID is required' });
    }

    const name = await fetchDataExtensionName(dataExtensionId);
    if (name) {
      return res.json({ name });
    } else {
      return res.status(500).json({ error: 'Failed to fetch Data Extension name.' });
    }
  }

  return res.status(405).end();
}
