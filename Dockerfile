# Stage 1: Build the TypeScript code
FROM node:20 as builder

WORKDIR /app

# Copy package files and install all dependencies
# This layer is only rebuilt if package.json or package-lock.json changes
COPY package*.json ./
RUN npm install

# Copy the tsconfig file
COPY tsconfig.json ./

# Copy your source code
# This layer is only rebuilt if files in the src directory change
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]