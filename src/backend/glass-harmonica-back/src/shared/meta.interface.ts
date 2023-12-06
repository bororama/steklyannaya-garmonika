

export interface User {
  userId: string;
  userName: string;
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
  chat: (e: Message) => void;
}

export interface ClientToServerEvents {
  chat: (message : Message) => void;
  playerUpdate : (player : Player) => void;
}