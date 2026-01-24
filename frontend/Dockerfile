# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV production

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
# COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
