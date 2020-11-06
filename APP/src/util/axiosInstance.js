import axios from 'axios';
import key from './etc/letsencrypt/live/www.zaintza.eus/privkey.pem';
import cert from './etc/letsencrypt/live/www.zaintza.eus/cert.pem';

const instance = axios.create({
  key: key,
  cert: cert,
  passphrase: 'jonzaintza'
});

export default instance;

