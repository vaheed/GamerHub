# **App Name**: GamerHub

## Core Features:

- Steam Login: Uses Nakama’s custom authentication with Steam’s OpenID.
- System ID Login: Automatically detects a unique device fingerprint (e.g., UUID from localStorage or device hash). Login with Nakama using authenticateDevice.
- Lobby System: Uses Nakama’s real-time multiplayer and matchmaker. Users can create private/public lobbies, invite friends, or auto-match with others. In-lobby chat powered by Nakama’s chat channels.
- Player Dashboard: Custom UI built in Firebase Studio (or Vue/React frontend) using REST/WebSocket calls to Nakama. Shows: Match summaries, Player stats (wins, K/D, ELO), Last activity
- Match Summary (AI-Powered): Match data stored via Nakama’s JSON storage system. Summary generated by an AI microservice via webhook or RPC. Key moments, best plays, and metrics shown on dashboard.
- Chat System: Global, private, and room-based channels using Nakama's chat features. Realtime messaging with WebSocket support. Message history persisted for later viewing.
- Game Integration: CS:GO and Dota 2 via Steam Web API, League of Legends via Riot API. External data bridged by backend microservices (Node.js/Go) and saved to Nakama storage.
- Leaderboards: Real-time global leaderboards using Nakama's built-in system. Supports: Win count, ELO score, K/D ratio. Filterable by game, friends, or region.
- External Integration: Designed for syncing with local LAN platforms like Gamenet. Future compatibility with reports or overlay features via API bridge.

## Style Guidelines:

- Primary: Dark Blue #1A202C
- Secondary: Light Gray #EDF2F7
- Accent: Teal #4DCDB3
- Typography: Modern, clean (Inter / SF Pro)
- Icons: Lucide / Heroicons
- Layout: Fully responsive (mobile-friendly)
- UX: Smooth transitions, feedback animations