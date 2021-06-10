ARG NODE_VERSION="14.16.0"
ARG PORT="8887"

FROM node:${NODE_VERSION}-alpine AS resource-builder

COPY ./ /db/
WORKDIR /db

RUN npm install \
    && npm run start

EXPOSE ${PORT}
