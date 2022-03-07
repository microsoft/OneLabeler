ARG NODE_VERSION="14.16.0"
ARG NGINX_VERSION="1.21.0"
ARG PORT="8080"

FROM node:${NODE_VERSION}-alpine AS build-stage
COPY /client /client
WORKDIR /client
RUN npm install \
    && npm run build

FROM nginx:${NGINX_VERSION}-alpine AS production-stage
RUN mkdir /client
COPY --from=build-stage /client/dist /client
COPY /client/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE ${PORT}
