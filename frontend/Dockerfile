FROM node:20-slim

WORKDIR /usr/src/app

# Copy root package.json mapping monorepo dependency
COPY package.json ./

# Copy the frontend project files
COPY frontend ./frontend

WORKDIR /usr/src/app/frontend

# Install dependencies with relaxed networking for Docker
RUN npm config set strict-ssl false && npm install --registry=http://registry.npmjs.org/ --verbose

EXPOSE 5173

# Run the dev server exposed to external traffic
CMD ["npm", "run", "dev", "--", "--host"]
