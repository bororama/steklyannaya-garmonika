

export interface User {
  id: number;
  name: string;
} 

export interface Message {
  user: User;
  message: string;
}

export interface Player {
  user: User;
  position: Array<number>;
  state : number
}

export interface ServerToClientEvents {
  chat: (message : Message) => void;
}

export interface ClientToServerEvents {
  chat: (message : Message) => void;
  playerUpdate : (player : Player) => void;
}