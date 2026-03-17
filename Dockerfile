# Step 1: Base image
FROM node:21.6.1-alpine

# Step 2: Set the working directory in the container
WORKDIR /ai_video_frontend

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Configure npm for better network reliability and install dependencies
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

# Step 5: Copy the rest of your client-side code into the container
COPY . .

# Step 5.1: Accept build arguments for env vars
# Backend API URLs (required for OAuth and API calls)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_VIDEO_GEN_API_URL

# Google OAuth
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URL

# Microsoft OAuth
ARG NEXT_PUBLIC_MICROSOFT_CLIENT_ID
ARG NEXT_PUBLIC_MICROSOFT_REDIRECT_URL

# GitHub OAuth
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_GITHUB_REDIRECT_URL

# External app URLs (optional)
ARG NEXT_PUBLIC_CHATBOT_URL
ARG NEXT_PUBLIC_MYNOTEBOOKLM_URL

# Step 5.2: Set them as ENV so Next.js sees them at build time
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_VIDEO_GEN_API_URL=$NEXT_PUBLIC_VIDEO_GEN_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URL=$NEXT_PUBLIC_GOOGLE_REDIRECT_URL
ENV NEXT_PUBLIC_MICROSOFT_CLIENT_ID=$NEXT_PUBLIC_MICROSOFT_CLIENT_ID
ENV NEXT_PUBLIC_MICROSOFT_REDIRECT_URL=$NEXT_PUBLIC_MICROSOFT_REDIRECT_URL
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID
ENV NEXT_PUBLIC_GITHUB_REDIRECT_URL=$NEXT_PUBLIC_GITHUB_REDIRECT_URL
ENV NEXT_PUBLIC_CHATBOT_URL=$NEXT_PUBLIC_CHATBOT_URL
ENV NEXT_PUBLIC_MYNOTEBOOKLM_URL=$NEXT_PUBLIC_MYNOTEBOOKLM_URL

# Step 6: Build your Next.js application
RUN npm run build

# Step 7: Expose the port Next.js runs on
EXPOSE 3000

# Step 8: Command to run the application
CMD ["npm", "start"]
