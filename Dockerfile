FROM oven/bun:1

# Install yt-dlp
RUN apt-get update && apt-get install -y yt-dlp && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY . .

EXPOSE 3000
CMD ["bun", "run", "server.ts"]
