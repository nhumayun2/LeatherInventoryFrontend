const fs = require('fs');
const path = require('path');

// Target path for the environment file
const envFilePath = path.join(__dirname, 'src', 'environments', 'environment.ts');

// Read the API URL from Vercel's environment variables, default to your personal one if not set
const apiUrl = process.env.ANGULAR_API_URL || 'https://karigar-api.onrender.com/api';

const envFileContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(envFilePath, envFileContent, 'utf8');
console.log(`Environment file generated dynamically with API URL: ${apiUrl}`);