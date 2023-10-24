import { getDataExtensionDetails, fetchDataExtensionName } from '../../lib/salesforceREST';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const dataExtensionId = req.query.id;

    if (!dataExtensionId) {
      return res.status(400).json({ error: 'Data Extension ID is required' });
    }

    const details = await getDataExtensionDetails(dataExtensionId);
    const name = await fetchDataExtensionName(dataExtensionId); // Fetching the name using SOAP

    return res.json({ name, ...details });
  }

  return res.status(405).end();
}
