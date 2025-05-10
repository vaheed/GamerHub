export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  elo: number;
  kdRatio: number;
  wins: number;
}

export interface Lobby {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPublic: boolean;
  game: string; 
}

export interface ChatMessage {
  id: string;
  sender: Pick<Player, 'id' | 'name' | 'avatarUrl'>;
  content: string;
  timestamp: Date;
  channelId: string; 
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  score: number; 
}

export interface MatchSummary {
  id: string;
  game: string;
  date: Date;
  result: 'Win' | 'Loss' | 'Draw';
  summaryText: string;
  keyMoments?: string[];
  bestPlays?: string[];
}

export interface Game {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}
