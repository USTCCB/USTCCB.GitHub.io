const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = 'b4ffa18c-e025-4fcb-86e7-a27aee74e72c';

const query = `
query {
  deployments(input: { projectId: "${PROJECT_ID}" }) {
    edges {
      node {
        id
        status
        createdAt
        staticUrl
        service {
          name
        }
      }
    }
  }
}
`;

const data = JSON.stringify({ query });
const options = {
  hostname: 'backboard.railway.app',
  path: '/graphql/v2',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const deployments = json?.data?.deployments?.edges || [];
      deployments.slice(0, 3).forEach(e => {
        const d = e.node;
        console.log(`${d.status} | ${d.id} | ${d.service?.name || 'unknown'} | ${d.createdAt}`);
      });
    } catch(e) {
      console.log('Raw:', body.slice(0, 500));
    }
  });
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
