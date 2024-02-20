# Build stage: Install all dependencies and build the application
FROM node:alpine AS builder
WORKDIR /home/node/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY . .
RUN npm run build

# Production stage: Start with a fresh image and copy over the compiled code
FROM node:alpine
ENV NODE_ENV=production
WORKDIR /home/node/app

# Copy production dependencies and the built code
COPY package*.json ./
RUN npm ci
COPY --from=builder /home/node/app/dist ./dist

CMD ["npm", "start"]
