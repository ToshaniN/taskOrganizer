FROM node:16-alpine AS build
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

# Serve Application using Nginx Server
FROM nginx:alpine
COPY --from=build /app/dist/taskOrganizer/ /usr/share/nginx/html

#Run command: docker run -p 4200:80 task_organizer-frontend

# FROM nginx:1.17.1-alpine
# COPY /dist/taskOrganizer /usr/share/nginx/html 