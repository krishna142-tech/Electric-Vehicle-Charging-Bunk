const selfsigned = require('selfsigned');
const fs = require('fs');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'IN' },
  { name: 'organizationName', value: 'EV Charging Station Dev' },
  { name: 'organizationalUnitName', value: 'Development' }
];

console.log('Generating self-signed certificates...');

const pems = selfsigned.generate(attrs, {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048,
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2, // DNS
          value: 'localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        }
      ]
    }
  ]
});

fs.writeFileSync('cert.pem', pems.cert);
fs.writeFileSync('key.pem', pems.private);

console.log('SSL certificates generated successfully!');
console.log('cert.pem and key.pem have been created.'); 