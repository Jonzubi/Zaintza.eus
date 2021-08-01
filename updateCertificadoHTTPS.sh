#!/bin/sh
pm2 stop all
certbot renew
pm2 restart all