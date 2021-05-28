FROM node:14-alpine

# Env
ENV PATH="./node_modules/.bin:${PATH}"

# Create Directory for the Container
WORKDIR /usr/src/app
RUN chown -R 65534:65534 /usr/src/app

# Only copy the package.json file to work directory
COPY package.json .

# Install all Packages
RUN npm install

# Copy all other source code to work directory
# ADD . /usr/src/app
COPY --chown=65534:65534 . /usr/src/app

# TypeScript
RUN npm run build

# Start
EXPOSE 3000
CMD [ "node", "-r", "dotenv/config", "./dist/index.js" ]
