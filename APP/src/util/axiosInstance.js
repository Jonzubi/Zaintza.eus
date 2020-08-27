import axios from 'axios';
import https from 'https';

const instance = axios.create();

instance.defaults.httpsAgent = new https.Agent({ rejectUnauthorized:false });

export default instance;

