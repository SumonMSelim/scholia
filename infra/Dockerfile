# Tooling image for CDK: node + docker CLI (talks to the host daemon through the mounted socket).
FROM node:22-alpine
RUN apk add --no-cache docker-cli git
WORKDIR /app/infra
