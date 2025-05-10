import type { Session as NakamaJsSession, Account as NakamaJsAccount, ChannelMessage as NakamaJsChannelMessage } from "@heroiclabs/nakama-js";

export interface NakamaSession extends NakamaJsSession {}
export interface NakamaAccount extends NakamaJsAccount {}
export interface NakamaChannelMessage extends NakamaJsChannelMessage {}


export interface Player {
  id: string; // Nakama user ID
  username: string; // Nakama username
  displayName?: string; // Nakama display_name
  avatarUrl?: string; // Nakama avatar_url
  // Custom game-specific stats, potentially stored in Nakama user metadata
  elo: number;
  kdRatio: number;
  wins: number;
  // Nakama specific fields if needed directly
  langTag?: string;
  location?: string;
  timezone?: string;
  metadata?: any; // Nakama metadata (JSON)
  createTime?: string; // Nakama create_time
  updateTime?: string; // Nakama update_time
}

export interface Lobby {
  id: string; // Could be Nakama Group ID or Match ID
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPublic: boolean;
  game: string; // Game identifier (e.g., "CS:GO", "Dota 2")
  hostId?: string; // User ID of the host
  // Potentially Nakama group specific fields
  groupId?: string; 
  matchId?: string;
}

export interface ChatMessage {
  id: string; // Nakama message_id
  sender: Pick<Player, 'id' | 'username' | 'displayName' | 'avatarUrl'>; // sender_id and denormalized info
  content: string; // Nakama content (often JSON string, parse if needed)
  timestamp: Date; // Nakama create_time (transformed to Date)
  channelId: string; // Nakama channel_id
  code?: number; // Nakama message code
  persistent?: boolean; // Nakama persistence flag
}

export interface LeaderboardEntry {
  rank: number;
  player: Pick<Player, 'id' | 'username' | 'displayName' | 'avatarUrl'>; // Denormalized player info
  score: number; 
  numScore?: number; // Nakama num_score
  ownerId?: string; // Nakama owner_id (user ID)
  metadata?: any; // Nakama metadata for the record
}

// MatchSummary would likely be a custom data structure, as Nakama itself doesn't store rich summaries.
// This data might be assembled from Nakama match data + custom processing (e.g., by GenAI flow).
export interface MatchSummary {
  id: string; // Could be a custom ID or related to a Nakama match ID
  game: string;
  date: Date;
  result: 'Win' | 'Loss' | 'Draw';
  summaryText: string; // Potentially AI-generated
  keyMoments?: string[];
  bestPlays?: string[];
  // Raw match data that was summarized, if needed
  // rawNakamaMatchData?: any; 
}

export interface Game {
  id: string; // e.g. "csgo", "dota2"
  name: string; // e.g. "CS:GO", "Dota 2"
  icon?: React.ComponentType<{ className?: string }>; // For UI
  imageUrl?: string; // For UI if not using component
}
