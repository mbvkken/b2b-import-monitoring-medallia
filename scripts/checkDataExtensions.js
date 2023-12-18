const axios = require('axios');

const SERVER_BASE_URL = process.env.VERCEL_SERVER_BASE_URL || 'http://localhost:3000'; // Adjust this to the address where your server runs
const DATA_EXTENSION_KEYS = process.env.MC_DE_KEYS ? process.env.MC_DE_KEYS.split(',') : [];
const VERCEL_URL = process.env.VERCEL_SERVER_BASE_URL;

const sentNotifications = new Set(); // Create a Set to store sent notifications

async function notifySlack(message, dataExtensionName) {
  const notificationKey = `${dataExtensionName}:${message}`;

  if (sentNotifications.has(notificationKey)) {
    console.log('Notification already sent:', message);
    return;
  }

  try {
    await axios.post(`${SERVER_BASE_URL}/api/sendToSlack`, {
      text: message,
      dataExtensionName: dataExtensionName, // Include dataExtensionName in the payload
    });
    console.log('Slack notification sent:', message);
    sentNotifications.add(notificationKey); // Add the notification to the Set to mark it as sent
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

async function checkDataExtension(dataExtensionKey) {
  try {
    const response = await axios.get(`${SERVER_BASE_URL}/api/data-extensions?id=${dataExtensionKey}`);
    const fetchedData = response.data;

    for (const dataExtension of fetchedData) {
      console.log(`Data Extension: ${dataExtension.name}`);

      // Check the total number of records for specific data extensions
      if (
        (dataExtension.items.length < 1000 && dataExtension.name === 'medallia_rnps_end_user_import_url') ||
        (dataExtension.items.length < 1 && dataExtension.name === 'datacom_I_deliver_survey_url') ||
        (dataExtension.items.length < 1 && dataExtension.name === 'datacom_I_onboard_survey_url')
      ) {
        const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
        const vercelURL = VERCEL_URL;
        const message = `On the latest import, the Data Extension "${dataExtension.name}" has ${dataExtension.items.length} records which is less than the expected 1000 records. This could be correct, but maybe worth checking out? Check status <${vercelURL}|here>. Head over to <${adminPanelURL}|Automation Studio> to fix it if need be.`;
        notifySlack(message, dataExtension.name);
      }

      // Check if survey_url is valid for each item in this data extension
      for (const item of dataExtension.items) {
        if (!isValidURL(item.values.survey_url)) {
          const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
          const vercelURL = VERCEL_URL;
          const message = `Invalid URL detected in "${dataExtension.name}". Check status <${vercelURL}|here>. Head over to <${adminPanelURL}|Automation Studio> to fix it if need be.`;
          notifySlack(message, dataExtension.name);
        }
      }
    }
  } catch (err) {
    console.error(`Error occurred while processing Data Extension ${dataExtensionKey}:`, err.message);
  }
}


// Loop through the array of DATA_EXTENSION_KEYS and check each data extension
async function checkDataExtensions(dataExtensionKeys) {
  for (const deKey of dataExtensionKeys) {
    await checkDataExtension(deKey);
  }
}

// Invoke the function to check the data extensions
checkDataExtensions(DATA_EXTENSION_KEYS);
