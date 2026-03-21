# Step 1: Use official Node.js 20 image (Alpine = lightweight)
FROM node:20-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package files first (Docker cache optimization)
COPY package*.json ./

# Step 4: Install all dependencies
RUN npm install

# Step 5: Copy all project source files
COPY . .

# Step 6: Compile TypeScript → JavaScript
RUN npm run build

# Step 7: Create data directory inside container
RUN mkdir -p data

# Step 8: Tell Docker which port the app uses
EXPOSE 3000

# Step 9: Start the compiled app
CMD ["npm", "start"]