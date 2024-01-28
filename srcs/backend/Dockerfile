FROM node:lts-alpine3.18

# make the 'app' folder the current working directory
WORKDIR /app

RUN npm i -g @nestjs/cli

# copy both 'package.json' and 'package-lock.json' (if available)
COPY ./db-api/package*.json ./

# install project dependencies
RUN npm install

RUN npm i -g npm install socket.io @nestjs/platform-express
# copy project files and folders to the current working directory (i.e., 'app' folder)
COPY ./db-api/ .

# build the application in the container
RUN npm run build

EXPOSE 3000

# start the server in development mode
CMD [ "nest", "start", "--watch" ]
