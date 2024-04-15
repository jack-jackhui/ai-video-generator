# Step 1: Base image
FROM node:21.6.1-alpine

# Step 2: Set the working directory in the container
WORKDIR /ai_video_frontend

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./
#COPY tailwind.config.js ./
#COPY jsconfig.json ./
#COPY next.config.mjs ./
#COPY postcss.config.js ./
#COPY .eslintrc.json ./
# Step 4: Install dependencies
RUN npm install
#RUN npm list

# Step 5: Copy the rest of your client-side code into the container
COPY . .

# Step 6: Build your Next.js application
RUN npm run build

# Step 7: Expose the port Next.js runs on
EXPOSE 3000

# Step 8: Command to run the application
CMD ["npm", "start"]
