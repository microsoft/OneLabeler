ARG NODE_VERSION="14.16.0"
ARG PORT="8887"

FROM node:${NODE_VERSION}-alpine
COPY /db /db
WORKDIR /db
RUN npm install
EXPOSE ${PORT}

# reference: https://stackoverflow.com/questions/51938049/mongodb-connection-error-inside-docker-container
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

## Launch the wait tool and then the application
CMD /wait && npm run start:prod
