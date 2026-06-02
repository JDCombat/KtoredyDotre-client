FROM node:latest

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

CMD [ "npx", "vite", "--host" ]