# GamerHub

GamerHub is a platform designed to be your central hub for gaming, integrating features like Steam/System ID login, lobbies, player dashboards, AI-powered match summaries, chat, game integration, and leaderboards, all powered by Nakama as the backend.

## Core Features:

-   **Authentication**: Secure login via Steam OpenID or unique System ID (device fingerprint) using Nakama.
-   **Lobby System**: Create and join public/private game lobbies with real-time chat, powered by Nakama's matchmaker and chat channels.
-   **Player Dashboard**: Personalized space showcasing match summaries, detailed player statistics (wins, K/D, ELO), and recent activity.
-   **AI-Powered Match Summary**: Get intelligent summaries of your game performances, highlighting key moments and metrics, generated via Genkit and stored in Nakama.
-   **Chat System**: Engage in global, private, and room-based conversations with persistent message history.
-   **Game Integration**: Supports popular titles like CS:GO, Dota 2, and League of Legends through their respective APIs, with data bridged to Nakama.
-   **Leaderboards**: Compete on real-time global leaderboards for various metrics like ELO, win count, and K/D ratio.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Backend Setup (Nakama)

GamerHub uses [Nakama](https://heroiclabs.com/nakama/) as its backend server. The easiest way to run Nakama is using Docker.

### 1. Create a `docker-compose.yml` file

Create a file named `docker-compose.yml` in a directory of your choice (this can be outside the GamerHub frontend project) with the following content:

```yaml
version: '3'
services:
  nakama:
    image: heroiclabs/nakama:3.19.0 # Or the latest stable version
    container_name: nakama
    expose:
      - "7349" # gRPC + HTTP API
      - "7350" # gRPC + HTTP API
      - "7351" # gRPC API
    ports:
      - "7349:7349"
      - "7350:7350"
      - "7351:7351"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7350/"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Nakama startup parameters
    # Full list of Nakama runtime options:
    # https://heroiclabs.com/docs/nakama/getting-started/configuration/
    command:
      # Set a predictable node name.
      - --name
      - nakama1
      # Database connection settings.
      - --database.address
      - cockroach:26257
      # Logging settings.
      - --logger.level
      - DEBUG
      # Session authentication settings.
      - --session.token_expiry_sec
      - "86400"
      # Runtime Lua/Go code settings.
      - --runtime.path
      - /nakama/data
      # Leaderboard settings
      - --leaderboard.module
      - "leaderboard" # Built-in leaderboard module
    links:
      - cockroach
    depends_on:
      cockroach:
        condition: service_healthy
    volumes:
      - ./nakama_data:/nakama/data # Mount a local directory for runtime code if needed
    restart: unless-stopped

  cockroach:
    image: cockroachdb/cockroach:v23.1.10 # Or the latest stable version
    container_name: cockroach
    expose:
      - "8080"  # Admin UI
      - "26257" # Default port
    ports:
      - "8080:8080"
      - "26257:26257"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health?ready=1"]
      interval: 10s
      timeout: 5s
      retries: 15
    volumes:
      - cockroach_data:/cockroach/cockroach-data
    command: start-single-node --insecure

volumes:
  cockroach_data:
```

### 2. Run Nakama Server

Navigate to the directory where you saved `docker-compose.yml` and run:

```bash
docker-compose up
```

This will start Nakama and its CockroachDB database. You should see logs from both services.

### 3. Access Nakama Console (Optional)

Once Nakama is running, you can access its developer console by opening `http://127.0.0.1:7350` in your web browser.

## Frontend Setup (Next.js)

### 1. Clone the Repository

If you haven't already, clone the GamerHub frontend repository:

```bash
git clone <repository_url>
cd gamerhub-frontend # Or your project directory name
```

### 2. Install Dependencies

Install the project dependencies:

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

The frontend needs to know how to connect to your Nakama instance. Create a `.env.local` file in the root of your frontend project directory:

```bash
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Nakama Server Configuration
NEXT_PUBLIC_NAKAMA_SERVER_KEY="defaultkey"
NEXT_PUBLIC_NAKAMA_HOST="127.0.0.1"
NEXT_PUBLIC_NAKAMA_PORT="7350"
NEXT_PUBLIC_NAKAMA_USE_SSL="false"

# Google AI API Key for Genkit (if using AI features)
# Create an API key in Google AI Studio: https://aistudio.google.com/app/apikey
# Ensure the Gemini API is enabled for your project in Google Cloud Console.
NEXT_PUBLIC_GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
```

**Explanation of Variables:**

-   `NEXT_PUBLIC_NAKAMA_SERVER_KEY`: The server key for your Nakama instance. Defaults to `defaultkey` if not set, which matches the Docker Compose example.
-   `NEXT_PUBLIC_NAKAMA_HOST`: The hostname or IP address of your Nakama server. Defaults to `127.0.0.1` (localhost).
-   `NEXT_PUBLIC_NAKAMA_PORT`: The port your Nakama server is listening on. Defaults to `7350`.
-   `NEXT_PUBLIC_NAKAMA_USE_SSL`: Set to `true` if your Nakama server is using SSL, otherwise `false`. Defaults to `false`.
-   `NEXT_PUBLIC_GOOGLE_API_KEY`: Your API key for Google AI services, used by Genkit for features like AI Match Summary.

**Important**: If your Nakama server is running on a different host or port, or if you changed the server key, update these values accordingly in `.env.local`.

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running, typically at `http://localhost:9002`. It will attempt to connect to the Nakama instance specified in your `.env.local` file.

## Connecting Frontend to Nakama

The frontend application (`src/lib/nakama-client.ts`) uses the `NEXT_PUBLIC_NAKAMA_*` environment variables you configured to establish a connection with your Nakama server. If you encounter connection issues:

1.  Ensure your Nakama server (from Docker Compose) is running and accessible.
2.  Verify that the host, port, SSL settings, and server key in your `.env.local` file match your Nakama server's configuration.
3.  Check your browser's developer console for any error messages related to Nakama connection.

## Development

### AI Features (Genkit)

This application uses Genkit for AI-powered features like match summarization.

-   Ensure you have set `NEXT_PUBLIC_GOOGLE_API_KEY` in your `.env.local` file.
-   To run the Genkit development server (for inspecting flows, etc.), use:
    ```bash
    npm run genkit:dev
    # or
    yarn genkit:dev
    ```
-   For watching changes and auto-restarting Genkit:
    ```bash
    npm run genkit:watch
    # or
    yarn genkit:watch
    ```
    Genkit UI will typically be available at `http://localhost:4000`.

## Building for Production

To build the Next.js application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

Ensure your production environment has the necessary environment variables set for Nakama and any other services.
