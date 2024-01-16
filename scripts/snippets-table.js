// require src\snippets.json file

const snippets = require('../src/snippets.json');

// snippets has this structure:
// {
//     "Config": {
//       "prefix": "devproxy-config",
//       "body": [
//         "{",
//         "\t\"\\$schema\": \"https://raw.githubusercontent.com/microsoft/dev-proxy/main/schemas/v1.0/rc.schema.json\",",
//         "\t\"plugins\": [$1],",
//         "\t\"urlsToWatch\": [$2],",
//         "\t\"rate\": 50,",
//         "\t\"labelMode\": \"text\",",
//         "\t\"logLevel\": \"info\"",
//         "}"
//       ],
//       "description": "Dev Proxy config file"
//     }
// }

// iterate over snippets and print out the prefix and description as a markdown table
console.log('| Prefix | Description |');
console.log('| ------ | ----------- |');
for (const [key, value] of Object.entries(snippets)) {
    console.log(`| \`${value.prefix}\` | ${value.description} |`);
}