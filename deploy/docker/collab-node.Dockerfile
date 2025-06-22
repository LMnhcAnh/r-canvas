# deploy/docker/collab-node.Dockerfile
FROM node:18

WORKDIR /app
COPY ./server/collab-node ./server/collab-node
WORKDIR /app/server/collab-node

RUN npm install

EXPOSE 3001
CMD ["node", "index.js"]
