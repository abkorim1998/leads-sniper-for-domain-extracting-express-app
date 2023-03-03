# will-telegram-cliant-express-app
this is the node.js project. it can be deployed anywhere where the node.js running.

## need node version 16.15.0 or uper
## install the nodejs and npm
> - apt install nodejs
> - apt install npm

## setup the app
> - git clone https://github.com/abkorim1998/will-telegram-cliant-express-app.git
> - cd will-telegram-cliant-express-app
> - npm i
> - npm i pm2 -g
> - pm2 start index.js

## for port forwording 
> - apt inistall nginx
> - nano /etc/nginx/sites-available/default
> - replace location
> - location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
