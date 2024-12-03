# syntax=docker/dockerfile:1

# Specify the base image
ARG NODE_VERSION=22.2.0
FROM node:${NODE_VERSION}-alpine

# Set the environment to production
ENV NODE_ENV production

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./ 

# Set working directory
WORKDIR /

# Install production dependencies
RUN npm ci --omit=dev

# Run the application as a non-root user
USER node


COPY src/ /src

# Expose the port that the application listens on
EXPOSE 8080

# Run the application using the transpiled code from dist folder
CMD ["node", "src/server.mjs"]
