FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Arguments
ARG DB_HOST
ENV DB_HOST=${DB_HOST}
RUN echo ${DB_HOST}

USER root
COPY package.json ./
RUN npm install

COPY --chown=node:node . .
RUN pwd

EXPOSE 4100

CMD [ "npm","run","start" ]