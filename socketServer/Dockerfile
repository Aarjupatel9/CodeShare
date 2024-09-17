# Select a base image
FROM  node:latest

# Create a directory  and go to the directory 
WORKDIR /appSocket/

# Copy the package.json file to my current directory to install the necessary dependence  
COPY package.json .

# Install the dependence
RUN npm install

# Copy other files to my current directory
COPY . .

# Open the port for the express server
EXPOSE 8081

# Run express rum in the foreground
CMD ["npm", "start"]