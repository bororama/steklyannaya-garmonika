FROM node:16

WORKDIR /meta-app

EXPOSE 8080 443

RUN npm install typescript -g

