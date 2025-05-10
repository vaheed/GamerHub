'use client';

import { Client, Session as NakamaJsSession } from "@heroiclabs/nakama-js";
import type { Account as NakamaJsAccount, ChannelMessage as NakamaJsChannelMessage, ApiMatchList, ApiGroupList, ApiLeaderboardRecordList, ApiUpdateAccountRequest, WriteStorageObject } from "@heroiclabs/nakama-js/dist/api.gen";

import type { Player, Lobby, ChatMessage, LeaderboardEntry, MatchSummary, NakamaSession } from '@/types';

const NAKAMA_SERVER_KEY = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY || "defaultkey";
const NAKAMA_HOST = process.env.NEXT_PUBLIC_NAKAMA_HOST || "127.0.0.1";
const NAKAMA_PORT = process.env.NEXT_PUBLIC_NAKAMA_PORT || "7350";
const NAKAMA_USE_SSL = (process.env.NEXT_PUBLIC_NAKAMA_USE_SSL || "false") === "true";

let nakamaClientInstance: Client | null = null;
let currentSession: NakamaSession | null = null;

function getNakamaClient(): Client {
  if (!nakamaClientInstance) {
    nakamaClientInstance = new Client(NAKAMA_SERVER_KEY, NAKAMA_HOST, NAKAMA_PORT, NAKAMA_USE_SSL);
    console.log("Nakama client initialized:", { host: NAKAMA_HOST, port: NAKAMA_PORT, ssl: NAKAMA_USE_SSL });
    // Attempt to restore session if client is just being initialized
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem("nakama_session_token");
        const refreshToken = localStorage.getItem("nakama_refresh_token");
        if (token) {
            currentSession = {
                token: token,
                refresh_token: refreshToken || undefined,
                created_at: parseInt(localStorage.getItem("nakama_session_created_at") || "0"),
                expires_at: parseInt(localStorage.getItem("nakama_session_expires_at") || "0"),
                user_id: localStorage.getItem("nakama_user_id") || "",
                username: localStorage.getItem("nakama_username") || "",
                vars: JSON.parse(localStorage.getItem("nakama_session_vars") || "{}"),
                refresh_expires_at: parseInt(localStorage.getItem("nakama_refresh_expires_at") || "0"),
            } as NakamaSession; // Cast, ensure all fields for NakamaSession type are handled
            nakamaClientInstance.session = currentSession; // Assign to client instance
            console.log("Restored Nakama session from localStorage for user:", currentSession.username);
        }
    }
  }
  return nakamaClientInstance;
}

function storeSession(session: NakamaSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem("nakama_session_token", session.token);
  if (session.refresh_token) localStorage.setItem("nakama_refresh_token", session.refresh_token);
  localStorage.setItem("nakama_user_id", session.user_id);
  localStorage.setItem("nakama_username", session.username);
  localStorage.setItem("nakama_session_created_at", session.created_at.toString());
  localStorage.setItem("nakama_session_expires_at", session.expires_at.toString());
  localStorage.setItem("nakama_refresh_expires_at", (session.refresh_expires_at || 0).toString());
  localStorage.setItem("nakama_session_vars", JSON.stringify(session.vars || {}));
  currentSession = session;
  getNakamaClient().session = session; // Ensure client instance also has the session
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("nakama_session_token");
  localStorage.removeItem("nakama_refresh_token");
  localStorage.removeItem("nakama_user_id");
  localStorage.removeItem("nakama_username");
  localStorage.removeItem("nakama_session_created_at");
  localStorage.removeItem("nakama_session_expires_at");
  localStorage.removeItem("nakama_refresh_expires_at");
  localStorage.removeItem("nakama_session_vars");
  currentSession = null;
  if (nakamaClientInstance) {
    nakamaClientInstance.session = undefined;
  }
}

export async function authenticateEmail(email: string, password?: string, create: boolean = true): Promise<NakamaSession> {
  const client = getNakamaClient();
  try {
    const session = await client.authenticateEmail(email, password || "password", create); // Use a default for mock if no password
    storeSession(session as NakamaSession);
    console.log("Nakama: Authenticated via Email for user:", session.username);
    return session as NakamaSession;
  } catch (error) {
    console.error("Nakama: Email authentication failed:", error);
    throw error;
  }
}

export async function authenticateDevice(deviceId: string, create: boolean = true, username?: string): Promise<NakamaSession> {
  const client = getNakamaClient();
  try {
    // For Steam, you'd use authenticateSteam and pass the Steam token.
    // Using device ID as a simpler alternative for this example.
    const session = await client.authenticateDevice(deviceId, create, username);
    storeSession(session as NakamaSession);
    console.log("Nakama: Authenticated via Device ID for user:", session.username);
    return session as NakamaSession;
  } catch (error) {
    console.error("Nakama: Device authentication failed:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  const client = getNakamaClient();
  if (currentSession) {
    try {
      await client.sessionLogout(currentSession);
      console.log("Nakama: Logged out successfully.");
    } catch (error) {
      console.error("Nakama: Logout failed:", error);
      // Clear session even if server logout fails, to allow re-login
    } finally {
      clearSession();
    }
  } else {
    clearSession(); // Ensure local state is cleared
  }
}

export function getCurrentNakamaSession(): NakamaSession | null {
    if (!currentSession && typeof window !== 'undefined') {
        // Attempt to restore if not already set
        const token = localStorage.getItem("nakama_session_token");
        if (token) {
             currentSession = {
                token: token,
                refresh_token: localStorage.getItem("nakama_refresh_token") || undefined,
                created_at: parseInt(localStorage.getItem("nakama_session_created_at") || "0"),
                expires_at: parseInt(localStorage.getItem("nakama_session_expires_at") || "0"),
                user_id: localStorage.getItem("nakama_user_id") || "",
                username: localStorage.getItem("nakama_username") || "",
                vars: JSON.parse(localStorage.getItem("nakama_session_vars") || "{}"),
                refresh_expires_at: parseInt(localStorage.getItem("nakama_refresh_expires_at") || "0"),
            } as NakamaSession;
        }
    }
    return currentSession;
}


export async function getAccountDetails(): Promise<Player> {
  const client = getNakamaClient();
  const session = getCurrentNakamaSession();
  if (!session) throw new Error("Not authenticated with Nakama.");

  try {
    const account = await client.getAccount(session) as NakamaJsAccount;
    const user = account.user;
    if (!user) throw new Error("Nakama account user data is missing.");

    // Fetch player stats from Nakama storage (example)
    let elo = 1500, kdRatio = 1.0, wins = 0;
    try {
        const storageObjects = await client.readStorageObjects(session, {
            objects: [{ collection: "player_stats", key: "stats", user_id: user.id }]
        });
        if (storageObjects.objects && storageObjects.objects.length > 0) {
            const statsData = JSON.parse(storageObjects.objects[0].value || "{}");
            elo = statsData.elo !== undefined ? statsData.elo : elo;
            kdRatio = statsData.kdRatio !== undefined ? statsData.kdRatio : kdRatio;
            wins = statsData.wins !== undefined ? statsData.wins : wins;
        }
    } catch (e) {
        console.warn("Nakama: No player stats found or error reading, using defaults.", e);
    }
    
    return {
      id: user.id,
      username: user.username || 'N/A',
      displayName: user.display_name || user.username || 'N/A',
      avatarUrl: user.avatar_url,
      elo,
      kdRatio,
      wins,
      langTag: user.lang_tag,
      location: user.location,
      timezone: user.timezone,
      metadata: user.metadata ? JSON.parse(user.metadata) : {},
      createTime: user.create_time,
      updateTime: user.update_time,
    };
  } catch (error) {
    console.error("Nakama: Failed to get account details:", error);
    if ((error as any).statusCode === 401) { // Example of handling auth error
        clearSession(); // Clear invalid session
        throw new Error("Session expired or invalid. Please login again.");
    }
    throw error;
  }
}

export async function updateAccountDetails(details: Partial<Player>): Promise<void> {
  const client = getNakamaClient();
  const session = getCurrentNakamaSession();
  if (!session) throw new Error("Not authenticated with Nakama.");

  const updateRequest: ApiUpdateAccountRequest = {};
  if (details.username) updateRequest.username = details.username;
  if (details.displayName) updateRequest.display_name = details.displayName;
  if (details.avatarUrl) updateRequest.avatar_url = details.avatarUrl;
  if (details.langTag) updateRequest.lang_tag = details.langTag;
  if (details.location) updateRequest.location = details.location;
  if (details.timezone) updateRequest.timezone = details.timezone;
  // Note: Nakama's metadata field on user account is different from storage objects.
  // For ELO, KDRatio, Wins, we'll use storage.

  try {
    if (Object.keys(updateRequest).length > 0) {
        await client.updateAccount(session, updateRequest);
        console.log("Nakama: Account core details updated.");
    }

    // Update player stats in storage
    const statsToUpdate: any = {};
    if (details.elo !== undefined) statsToUpdate.elo = details.elo;
    if (details.kdRatio !== undefined) statsToUpdate.kdRatio = details.kdRatio;
    if (details.wins !== undefined) statsToUpdate.wins = details.wins;

    if (Object.keys(statsToUpdate).length > 0 && session.user_id) {
        // Fetch existing stats to merge, or create new if none
        let existingStats = {};
        try {
            const storageObjects = await client.readStorageObjects(session, {
                objects: [{ collection: "player_stats", key: "stats", user_id: session.user_id }]
            });
            if (storageObjects.objects && storageObjects.objects.length > 0) {
                existingStats = JSON.parse(storageObjects.objects[0].value || "{}");
            }
        } catch(e) { /* ignore if not found */ }

        const newStats = { ...existingStats, ...statsToUpdate };

        const writeObject: WriteStorageObject = {
            collection: "player_stats",
            key: "stats",
            user_id: session.user_id, // This ensures it's user-specific storage
            value: JSON.stringify(newStats),
            permission_read: 1, // 0: no read, 1: owner read, 2: public read
            permission_write: 1 // 0: no write, 1: owner write
        };
        await client.writeStorageObjects(session, { objects: [writeObject] });
        console.log("Nakama: Player stats updated in storage.");
    }

  } catch (error) {
    console.error("Nakama: Failed to update account details:", error);
    throw error;
  }
}


// Mock implementation for recent matches. Nakama doesn't store these out-of-the-box.
// This would require custom logic (e.g., storing match results in Nakama Storage).
export async function listRecentMatches(userId: string): Promise<MatchSummary[]> {
  console.log("Nakama: Fetching recent matches for user (mock)", userId);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
  return [
    { id: "m1", game: "CS:GO", date: new Date(Date.now() - 86400000 * 1), result: "Win", summaryText: "Clutched a 1v3 on Dust II. (Nakama-fetched)", keyMoments: ["1v3 Clutch", "Triple Kill AWP"], bestPlays: ["Mid-air no-scope"] },
    { id: "m2", game: "Dota 2", date: new Date(Date.now() - 86400000 * 2), result: "Loss", summaryText: "Tough game. Good effort. (Nakama-fetched)", keyMoments: ["Early Gank Avoided"], bestPlays: ["Aegis Steal Attempt"] },
  ];
}


// Placeholder/Mock implementations for other features
export async function listLobbies(filter?: any): Promise<Lobby[]> {
    console.log("Nakama: Listing lobbies (mock)", filter);
    await new Promise(resolve => setTimeout(resolve, 500));
    // This would involve listing Nakama groups or matches based on some criteria
    return [
        { id: "nakama_lobby1", name: "CS:GO Nakama Grind", playerCount: 5, maxPlayers: 10, isPublic: true, game: "CS:GO", hostId: "some_user_id" },
        { id: "nakama_lobby2", name: "Dota 2 Nakama Fun", playerCount: 2, maxPlayers: 5, isPublic: true, game: "Dota 2", hostId: "another_user_id" },
    ];
}

export async function createLobby(name: string, game: string, isPublic: boolean, maxPlayers: number): Promise<Lobby> {
    const client = getNakamaClient();
    const session = getCurrentNakamaSession();
    if (!session) throw new Error("Not authenticated");

    console.log("Nakama: Creating lobby (mock/conceptual - likely a Group or Match)", { name, game, isPublic, maxPlayers });
    // Example using Nakama Groups for a lobby concept:
    // const createdGroup = await client.createGroup(session, { name, description: `Lobby for ${game}`, open: isPublic, max_count: maxPlayers, lang_tag: "en" });
    // return { id: createdGroup.id, name: createdGroup.name, playerCount: 1, maxPlayers: createdGroup.max_count, isPublic: createdGroup.open, game, hostId: session.user_id, groupId: createdGroup.id };
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 600));
    const newLobbyId = `nakama_lobby_${Date.now()}`;
    return { id: newLobbyId, name, playerCount: 1, maxPlayers, isPublic, game, hostId: session.user_id };
}

export async function joinLobby(lobbyId: string): Promise<void> {
    const client = getNakamaClient();
    const session = getCurrentNakamaSession();
    if (!session) throw new Error("Not authenticated");
    console.log("Nakama: Joining lobby (mock - could be client.joinGroup or client.joinMatch)", lobbyId);
    // Example: await client.joinGroup(session, lobbyId);
    await new Promise(resolve => setTimeout(resolve, 400));
}


export async function getLobbyDetails(lobbyId: string): Promise<Lobby & { players: Player[] }> {
    console.log("Nakama: Getting lobby details (mock)", lobbyId);
    // This would fetch Group details and list its members, or Match details and its presences
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockPlayers: Player[] = [
        { id: "p1_nakama", username: "HostNakama", displayName: "Host Nakama", elo: 1900, kdRatio: 1.8, wins: 150, avatarUrl: "https://picsum.photos/seed/hostNakama/40/40" },
        { id: "p2_nakama", username: "GamerNakama99", displayName: "Gamer Nakama 99", elo: 1750, kdRatio: 1.5, wins: 120, avatarUrl: "https://picsum.photos/seed/playerNakama2/40/40" },
    ];
    return { 
        id: lobbyId, 
        name: "Mock Nakama Lobby", 
        playerCount: mockPlayers.length, 
        maxPlayers: 10, 
        isPublic: true, 
        game: "CS:GO", 
        hostId: "p1_nakama",
        players: mockPlayers 
    };
}


// Chat functionalities
// Note: Real-time chat needs a socket connection managed by Nakama client.
// These are simplified API calls; actual implementation involves event listeners for messages.

export async function joinChatChannel(channelId: string, type: number = 1 /* ROOM */): Promise<any> { // Returns ChannelPresence
    const client = getNakamaClient();
    const session = getCurrentNakamaSession();
    if (!session) throw new Error("Not authenticated");
    if (!client.socket) {
        client.createSocket(NAKAMA_USE_SSL, false); // false for verbose logging
        await client.socket.connect(session, true /* create status */);
    }
    console.log("Nakama: Joining chat channel (mock)", channelId);
    return client.socket.joinChat(channelId, type, true /* persistence */, false /* hidden - not applicable to join*/);
}

export async function sendChatMessage(channelId: string, content: string): Promise<NakamaJsChannelMessage> { // Returns ApiChannelMessage
    const client = getNakamaClient();
    const session = getCurrentNakamaSession();
    if (!session || !client.socket) throw new Error("Not connected or authenticated");
    
    console.log("Nakama: Sending chat message (mock)", { channelId, content });
    // The content for Nakama messages is typically a JSON string.
    const messageContent = JSON.stringify({ text: content }); 
    return client.socket.writeChatMessage(channelId, messageContent);
}

export function onChatMessage(callback: (message: ChatMessage) => void) {
    const client = getNakamaClient();
     if (client.socket) {
        client.socket.onchannelmessage = (message: NakamaJsChannelMessage) => {
            console.log("Nakama: Received chat message (raw)", message);
            // Transform NakamaJsChannelMessage to your ChatMessage type
            let parsedContent = message.content;
            try {
                const contentObj = JSON.parse(message.content as string); // Nakama content is often JSON string
                parsedContent = contentObj.text || message.content;
            } catch (e) { /* ignore if not JSON or no text field */ }

            const chatMsg: ChatMessage = {
                id: message.message_id!,
                sender: { 
                    id: message.sender_id!, 
                    username: message.username!,
                    // displayName and avatarUrl might need separate fetching or be part of user presence
                },
                content: parsedContent as string,
                timestamp: new Date(message.create_time!),
                channelId: message.channel_id!,
                code: message.code?.value,
                persistent: message.persistent?.value,
            };
            callback(chatMsg);
        };
    }
}

export async function listLeaderboardRecords(leaderboardId: string, limit: number = 15, cursor?: string): Promise<LeaderboardEntry[]> {
    const client = getNakamaClient();
    const session = getCurrentNakamaSession();
    if (!session) throw new Error("Not authenticated");

    console.log("Nakama: Listing leaderboard records (mock)", leaderboardId);
    // const records = await client.listLeaderboardRecords(session, leaderboardId, null, null, limit, cursor);
    // return records.records?.map(r => ({ ... map to LeaderboardEntry ... })) || [];
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock data similar to existing leaderboard
    return Array.from({ length: limit }, (_, i) => ({
        rank: (cursor ? parseInt(cursor) : 0) + i + 1,
        player: {
            id: `nakama_p${i + 1}`,
            username: `NakamaPlayer${String.fromCharCode(65 + i)}${i + 10}`,
            displayName: `Nakama Player ${String.fromCharCode(65 + i)}${i + 10}`,
            avatarUrl: `https://picsum.photos/seed/nakama_leader${i}/40/40`,
        },
        score: 2200 - i * 50,
        ownerId: `nakama_p${i + 1}`,
    }));
}

// Initialize client and attempt to restore session on load
if (typeof window !== 'undefined') {
    getNakamaClient(); // This will also trigger restoreSession logic inside if applicable
}
