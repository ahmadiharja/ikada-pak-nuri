console.log('Starting API test...');

const http = require('http');

console.log('Creating request options...');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/products/categories?includeCount=true&hierarchical=true',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Making request to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log('Response received!');
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    console.log('Receiving data chunk...');
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response complete!');
    console.log('Response body length:', data.length);
    console.log('Response body (first 500 chars):', data.substring(0, 500));
    try {
      const parsed = JSON.parse(data);
      console.log('Successfully parsed JSON');
      console.log('Number of categories:', Array.isArray(parsed) ? parsed.length : 'Not an array');
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('First category:', JSON.stringify(parsed[0], null, 2));
      }
    } catch (e) {
      console.log('JSON parse error:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed!');
  console.error(`Request error: ${e.message}`);
  console.error('Error code:', e.code);
  console.error('Error errno:', e.errno);
});

console.log('Sending request...');
req.end();
console.log('Request sent!');