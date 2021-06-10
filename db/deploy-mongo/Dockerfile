ARG MONGO_VERSION="4.4.5"

FROM mongo:${MONGO_VERSION} AS database-builder

ENV PORT="27018"
RUN mongod --dbpath /data --port ${PORT}

EXPOSE ${PORT}
