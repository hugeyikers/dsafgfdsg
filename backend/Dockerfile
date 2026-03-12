FROM node:20-slim

WORKDIR /usr/src/app

# Copy root package.json mapping monorepo dependency
COPY package.json ./

# Copy the backend project files
COPY backend ./backend

WORKDIR /usr/src/app/backend

# Install dependencies with relaxed networking for Docker
RUN npm config set strict-ssl false && npm install --registry=http://registry.npmjs.org/ --verbose

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

EXPOSE 3000

# We use a shell command to ensure prisma schemas are pushed to DB before starting
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
