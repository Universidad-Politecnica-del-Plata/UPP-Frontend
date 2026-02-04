# Use a Node.js image to build the app
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the remaining source code
COPY . ./

# Build the production app
RUN npm run build

# Use a lightweight web server to serve the production build
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]