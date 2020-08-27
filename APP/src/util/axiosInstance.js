import axios from 'axios';
import https from 'https';
import fs from 'fs';

const instance = axios.create({
  key: fs.readFileSync('../SSL/key.pem'),
  cert: fs.readFileSync('../SSL/cert.pem'),
  passphrase: 'jonzaintza'
});

instance.defaults.httpsAgent = new https.Agent({ rejectUnauthorized:false });

export default instance;

