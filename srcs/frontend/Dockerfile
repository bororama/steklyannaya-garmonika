FROM debian:bullseye-slim
RUN apt-get update && apt-get install -yq npm curl
RUN npm i -g n
RUN n 16

WORKDIR /app/glass-harmonica
COPY ./glass-harmonica/package*.json ./
RUN npm i
RUN npm install vite

CMD [ "npm", "run", "dev" ]