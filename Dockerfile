FROM node:14

# create app directory

WORKDIR /usr/src/app

# Install all dependencies
# copies package.json and package-lock.json

COPY package*.json ./

RUN npm install

# Below should be run for production deployment
# RUN npm ci --only=production

COPY . .

CMD ["node","worker.js"]

EXPOSE 4001


