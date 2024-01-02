
export interface User {
  locator: number;
  name: string;
} 

export interface Message {
  user: User;
  message: string;
}

export interface Player {
  user: User;
  position: Array<number>;
  rotation: Array<number>;
  state : number
}

export interface ServerToClientEvents {
  chat: (message : Message) => void;
  newPlayer: (player : Player) => void;
}

export interface ClientToServerEvents {
  chat: (message : Message) => void;
  playerUpdate : (player : Player) => void;
}