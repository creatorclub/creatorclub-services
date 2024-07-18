const fs = require('fs');

const jsonContent = fs.readFileSync('/Users/ketankamble/Downloads/creatorclub-f1dcc-firebase-adminsdk-1m6vf-65e761a141.json', 'utf8');
const base64Content = Buffer.from(jsonContent).toString('base64');

console.log(base64Content);