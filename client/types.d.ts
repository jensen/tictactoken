interface IUser {
  id: string;
  username: string;
  avatar: string;
}

interface IGame {
  id: string;
  host_id: string;
  guest_id: string;
  state: Array<"x" | "o" | null>;
  host: IUser;
  guest: IUser;
  winner: string;
  x: string;
}
