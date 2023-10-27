async function checkDataExtensions(dataExtensionKeys) {
    const response = await axios.get(`${SERVER_BASE_URL}/api/data-extensions`);
    const dataExtensions = response.data;
  
    for (const fetchedData of dataExtensions) {
      // Check if the fetchedData is in the list of data extension keys to process
      if (!dataExtensionKeys.includes(fetchedData.key)) {
        console.log(`Skipping Data Extension "${fetchedData.name}" with key "${fetchedData.key}" as it is not in the list of keys to process.`);
        continue;
      }
  
      try {
        if (!fetchedData || !fetchedData.items) {
          console.error(`Data Extension with key "${fetchedData.key}" returned unexpected data:`, fetchedData);
          continue;
        }
  
        // Check the total number of records
        if (fetchedData.name === 'medallia_rnps_end_user_import_url' && fetchedData.items.length < 1001) {
          const adminPanelURL = "https://mc.s50.exacttarget.com/cloud/#app/Automation%20Studio/AutomationStudioFuel3/";
          const message = `UPDATEDOn latest import the Data Extension "${fetchedData.name}" has ${fetchedData.items.length} records which is less than the expected 1000 records. This could be correct, but maybe worth checking out? Head over to <${adminPanelURL}|Automation Studio>`;
          await notifySlack(message, fetchedData.name);
        }
  
        // Check if survey_url is valid for each item
        const invalidURLs = fetchedData.items.filter(item => !isValidURL(item.values.survey_url)).length;
        if (invalidURLs > 0) {
          const message = `${invalidURLs} or more invalid URLs detected in "${fetchedData.name}"`;
          await notifySlack(message, fetchedData.name);
        }
  
      } catch (err) {
        console.error('Error occurred:', err.message);
      }
    }
  }
  