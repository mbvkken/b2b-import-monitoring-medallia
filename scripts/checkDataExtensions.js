const axios = require('axios');

const SERVER_BASE_URL = process.env.VERCEL_SERVER_BASE_URL || 'http://localhost:3000';
const DATA_EXTENSION_KEYS = process.env.MC_DE_KEYS.split(',');
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function notifySlack(message, dataExtensionName) {
  if (!SLACK_WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL is not set. Cannot send Slack notification.');
    return;
  }

  const vercelURL = 'https://sfmc-app-monitoring.vercel.app/';
  const formattedMessage = `Check status <${vercelURL}|here>: ${message}`;

  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: formattedMessage
    });
    console.log('Slack notification sent for', dataExtensionName);
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
  for (const deKey of dataExtensionKeys) {
    try {
      const response = await axios.get(`${SERVER_BASE_URL}/api/data-extensions?id=${deKey}`);
      const fetchedData = response.data;

      if (!fetchedData || !fetchedData.items) {
        console.error(`Data Extension with key "${deKey}" returned unexpected data:`, fetchedData);
        continue;
      }

      // Check the total number of records
      if (fetchedData.name === 'medallia_rnps_end_user_import_url' && fetchedData.items.length < 1001) {
        const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
        const vercelURL = 'https://sfmc-app-monitoring.vercel.app/';
        const message = `Check status <${vercelURL}|here>: On latest import the Data Extension "${dataExtension.name}" has ${dataExtension.items.length} records which is less than the expected 1000 records. This could be correct, but maybe worth checking out? Head over to <${adminPanelURL}|Automation Studio>`;
        await notifySlack(message, fetchedData.name);
      }

      // Check if survey_url is valid for each item
      const invalidURLs = fetchedData.items.filter(item => !isValidURL(item.values.survey_url)).length;
      if (invalidURLs > 0) {
        const vercelURL = 'https://sfmc-app-monitoring.vercel.app/';
        const message = `Check status <${vercelURL}|here>: ${invalidURLs} or more invalid URLs detected in "${dataExtension.name}"`;
        await notifySlack(message, fetchedData.name);
      }

    } catch (err) {
      console.error('Error occurred:', err.message);
    }
  }
}

// Invoke the function to check the data extensions
checkDataExtensions(DATA_EXTENSION_KEYS);
