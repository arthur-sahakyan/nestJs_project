# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all application files to the working directory
COPY . .

# Expose the port your NestJS application is running on
EXPOSE 3000

# Define the command to start your NestJS application
CMD [ "npm", "start" ]
