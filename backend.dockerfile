#Using node version 22 as our base image
FROM node:22

#Set the working directory in the container to /app
WORKDIR /app

#Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

#Install the application dependencies
RUN npm install

#Install nodemon globally
RUN npm install -g nodemon

#Copy the rest of the app into the container
COPY . .

#Set default values for environment variables
ENV PORT=4000
#Expose the port so the container can access it
EXPOSE 4000

#Run your node.js application
CMD ["npm", "run", "dev"]