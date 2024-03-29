# Include the latest node image
FROM node:lts
# Aliases setup for container folders
ARG SERVER="/slek-server"
ARG SERVER_src="."
ARG BUILD="/slek-server/build"
ENV PORTS="3333"
# Set the working directory inside the container to server module
WORKDIR ${SERVER}
# Expose port outside container
EXPOSE ${PORTS}
# Copy server module
COPY ${SERVER_src} ${SERVER}
# Build TS files
RUN node ace build --production
# Update workdir
WORKDIR ${BUILD}
# Install production dependencies
RUN npm ci --production
# Start server module inside the container
CMD ["node", "server.js"]
