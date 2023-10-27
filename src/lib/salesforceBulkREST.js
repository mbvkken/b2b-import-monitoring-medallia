import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const BASE_URL = process.env.MC_AUTH_URL;
const REST_BASE_URL = process.env.MC_REST_URL;
const SOAP_ENDPOINT = process.env.MC_SOAP_ENDPOINT;

export async function getAccessToken() {
    try {
        const response = await axios.post(`${BASE_URL}/v2/token`, {
            grant_type: 'client_credentials',
            client_id: process.env.MC_CLIENT_ID,
            client_secret: process.env.MC_CLIENT_SECRET
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
    }
}

export async function getDataExtensionDetails(deKey, token) {
    if (!token) return null;

    try {
        const response = await axios.get(`${REST_BASE_URL}/data/v1/customobjectdata/key/${deKey}/rowset`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Failed to get data extension details for key', deKey, ':', error);
        return null;
    }
}

function generateSoapBody(token, deKey) {
    return `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:par="http://exacttarget.com/wsdl/partnerAPI">
            <soapenv:Header>
                <fueloauth>${token}</fueloauth>
            </soapenv:Header>
            <soapenv:Body>
                <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
                    <RetrieveRequest>
                        <ObjectType>DataExtension</ObjectType>
                        <Properties>Name</Properties>
                        <Filter xsi:type="SimpleFilterPart">
                            <Property>CustomerKey</Property>
                            <SimpleOperator>equals</SimpleOperator>
                            <Value>${deKey}</Value>
                        </Filter>
                    </RetrieveRequest>
                </RetrieveRequestMsg>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
}

export async function fetchDataExtensionName(deKey, token) {
    if (!token) {
        console.error('Unable to obtain access token');
        return null;
    }

    const body = generateSoapBody(token, deKey);

    try {
        const response = await axios.post(SOAP_ENDPOINT, body, {
            headers: {
                'Content-Type': 'text/xml',
                'SOAPAction': 'Retrieve'
            }
        });

        const result = await parseStringPromise(response.data);
        const name = result['soap:Envelope']['soap:Body'][0].RetrieveResponseMsg[0].Results[0].Name[0];

        return name;

    } catch (error) {
        console.error('Error fetching Data Extension name for key', deKey, ':', error);
        return null;
    }
}

export async function getBulkDataExtensionDetails(deKeys) {
    const token = await getAccessToken();

    if (!token) return null;

    try {
        const detailsPromises = deKeys.map(deKey => getDataExtensionDetails(deKey, token));
        const namePromises = deKeys.map(deKey => fetchDataExtensionName(deKey, token));

        const detailsResults = await Promise.all(detailsPromises);
        const nameResults = await Promise.all(namePromises);

        const results = deKeys.map((deKey, index) => {
            return {
                key: deKey,
                name: nameResults[index],
                items: detailsResults[index] ? detailsResults[index].items : [] // Ensure you have items property in detailsResults
            };
        });

        return results;
    } catch (error) {
        console.error('Failed to fetch data extensions details:', error);
        return null;
    }
}
