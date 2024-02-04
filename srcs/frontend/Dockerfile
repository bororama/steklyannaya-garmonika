FROM debian:bullseye-slim
RUN apt-get update && apt-get install -yq npm curl
RUN npm i -g n
RUN n 18

WORKDIR /app/glass-harmonica
COPY ./glass-harmonica/*.json ./
COPY ./glass-harmonica/*.ts ./
COPY ./glass-harmonica/*.html ./
RUN npm i

CMD [ "npm", "run", "dev"]