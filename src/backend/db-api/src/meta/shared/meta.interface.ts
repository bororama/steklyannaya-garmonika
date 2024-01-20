
export interface User {
  id: string;
  name: string;
} 

export interface Message {
  user: User;
  text: string;
}

export interface Player {
  user: User;
  position: Array<number>;
  rotation: Array<number>;
  state : number
}

export interface LiveClient { 
  socket : any; //Socket
  player : Player | null;
};

export interface ServerToClientEvents {
  chat: (message : Message) => void;
  newPlayer: (player : Player) => void;
}

export interface ClientToServerEvents {
  chat: (message : Message) => void;
  playerUpdate : (player : Player) => void;
}
