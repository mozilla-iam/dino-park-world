FROM node

WORKDIR /app

COPY package.json .
RUN npm install --production
COPY . /app
COPY update_cities.sh .
CMD ["node", "-r", "esm", "index.js"]