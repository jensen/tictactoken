import { createResource, createEffect, onMount } from "solid-js";
import { Link } from "solid-app-router";
import { useAuth } from "../context/auth";
import GameCreate from "./GameCreate";
import GameJoin from "./GameJoin";

interface IUserProps extends IUser {}

function User(props: IUserProps) {
  return (
    <div className="rounded-full p-1 bg-purple-500 flex items-center space-x-2">
      {props.avatar ? (
        <img className="w-8 h-8 rounded-full" src={props.avatar} />
      ) : (
        <div className="w-8 h-8 rounded-full bg-purple-300" />
      )}
      <div className="text-white pr-2">{props.username}</div>
    </div>
  );
}

interface IGameProps extends IGame {}

function Game(props: IGameProps) {
  return (
    <Link href={`games/${props.id}`}>
      <li className="w-full flex space-x-4 rounded-sm px-4 py-2 bg-slate-100 hover:bg-slate-200">
        <div className="w-1/2">
          <h2 className="flex justify-center uppercase text-sm font-bold text-gray-400">
            Host
          </h2>
          <User {...props.host} />
        </div>
        <div className="w-1/2">
          <h2 className="flex justify-center uppercase text-sm font-bold text-gray-400">
            Guest
          </h2>
          {props.guest ? <User {...props.guest} /> : <GameJoin id={props.id} />}
        </div>
      </li>
    </Link>
  );
}

export default function GameList() {
  const { user } = useAuth();
  const [games, { mutate }] = createResource<IGame[]>(async () =>
    (await fetch("/api/games")).json()
  );

  onMount(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_SOCKET_URL}/list`);

    websocket.onmessage = function (this: WebSocket, event: MessageEvent<any>) {
      const game = JSON.parse(event.data);
      const g = games();

      if (g) {
        if (g.find((g) => g.id == game.id)) {
          mutate(g.map((g) => (g.id === game.id ? game : g)));
        } else {
          mutate([...g, game]);
        }
      }
    };
  });

  return (
    <div className="w-80">
      {user && user() && (
        <GameCreate
          onNewGame={(game: IGame) => {
            const g = games();

            if (g) {
              mutate([...g, game]);
            }
          }}
        />
      )}
      <ul className="w-full flex flex-col space-y-2">
        {games()?.map((game) => (
          <Game {...game} />
        ))}
      </ul>
    </div>
  );
}
