import axios from 'axios';
import https from 'https';
import key from '../SSL/key.pem';
import cert from '../SSL/cert.pem';

const instance = axios.create({
  key: key,
  cert: cert,
  passphrase: 'jonzaintza'
});

instance.defaults.httpsAgent = new https.Agent({ rejectUnauthorized:false });

export default instance;

