const https = require('https');

const TOKEN = '6aea044a-74dc-4eec-bca3-7b98ab8618db';
const PROJECT_ID = '8386fc4c-4eb6-4ca6-b148-68db0dc78e9c';
const SERVICE_ID = '587b0fa0-6dc3-4cfe-87de-509edfb706d0';
const ENV_ID = '66753f8e-35cb-45a3-b9ba-986ed3f68a95';

// Railway 引用变量语法: ${{ ServiceName.VAR }}
const dbUrl = '${{Postgres.DATABASE_URL}}';

const query = `mutation {
  variableCollectionUpsert(input: {
    projectId: "${PROJECT_ID}"
    serviceId: "${SERVICE_ID}"
    environmentId: "${ENV_ID}"
    variables: {
      DATABASE_URL: "${dbUrl}"
    }
  })
}`;

const body = JSON.stringify({ query });
const options = {
  hostname: 'backboard.railway.app',
  path: '/graphql/v2',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});
req.on('error', e => console.error('Error:', e));
req.write(body);
req.end();
