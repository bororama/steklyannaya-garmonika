FROM debian:bullseye-slim
RUN apt-get update && apt-get install -yq npm curl lsof
RUN npm i -g n
RUN n 16
RUN npm i -g @nestjs/cli

WORKDIR /app