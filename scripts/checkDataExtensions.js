const axios = require('axios');

const SERVER_BASE_URL = process.env.VERCEL_SERVER_BASE_URL || 'http://localhost:3000'; // Adjust this to the address where your server runs
const DATA_EXTENSION_KEYS = process.env.MC_DE_KEYS ? process.env.MC_DE_KEYS.split(',') : [];

async function notifySlack(message) {
  try {
    const response = await axios.post(`${SERVER_BASE_URL}/api/sendToSlack`, {
      text: message
    });
    console.log('Slack notification sent:', response.data);
  } catch (error) {
    console.error('Failed to send Slack notification:', error.response ? error.response.data : error.message);
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

async function checkDataExtensions(dataExtensionKeys) {
  if (dataExtensionKeys.length === 0) {
    console.log('No Data Extension keys provided');
    return;
  }

  for (const deKey of dataExtensionKeys) {
    try {
      const response = await axios.get(`${SERVER_BASE_URL}/api/data-extensions`, { params: { id: deKey } });
      const fetchedData = response.data;

      if (!fetchedData || !fetchedData.items || !Array.isArray(fetchedData.items)) {
        console.error('Invalid response format for Data Extension', deKey);
        continue;
      }

      // Check the total number of records
      if (fetchedData.items.length < 100) {
        const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
        const message = `On latest import the Data Extension "${fetchedData.name}" has ${fetchedData.items.length} records which is less than the expected 100 records. This could be correct, but maybe worth checking out? Head over to <${adminPanelURL}|Automation Studio>`;
        await notifySlack(message);
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
        await notifySlack(message);
      }

    } catch (err) {
      console.error('Error occurred while processing Data Extension', deKey, ':', err.response ? err.response.data : err.message);
    }
  }
}

// Invoke the function to check the data extensions
checkDataExtensions(DATA_EXTENSION_KEYS);
