import axios from "axios";
console.log("PROCESS", process.env);
let instance;

if (process.env.NODE_ENV !== "development") {
  instance = axios.create({
    key: "/etc/letsencrypt/live/www.zaintza.eus/privkey.pem",
    cert: "/etc/letsencrypt/live/www.zaintza.eus/fullchain.pem",
    passphrase: "jonzaintza",
  });
} else {
  instance =axios.create();
}

export default instance;
