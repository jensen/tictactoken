import {
  createSignal,
  createEffect,
  createResource,
  onMount,
  Accessor,
} from "solid-js";
import { useParams } from "solid-app-router";
import cx from "classnames";
import { useAuth } from "../context/auth";

interface IStatusProps {
  game: Accessor<IGame>;
  turn: Accessor<string>;
  user: Accessor<IUser>;
}

function Status(props: IStatusProps) {
  const [result, setResult] = createSignal("");

  createEffect(() => {
    const g = props.game();

    if (g && g.winner) {
      const winner =
        g.winner === g.host.id ? g.host.username : g.guest.username;
      setResult(`${winner} Wins`);
    } else {
      if (g.state.every((v) => v !== null)) {
        setResult("Draw");
      } else {
        if (!props.user()) {
          setResult("Spectating");
        } else {
          setResult(props.turn() === props.user().id ? "Your Turn" : "Waiting");
        }
      }
    }
  });

  return (
    <div className="flex justify-center py-2">
      <span className="font-bold text-lg uppercase">{result()}</span>
    </div>
  );
}

interface ISquareProps {
  index: number;
  value: string | null;
  choose: () => void;
}

function Square(props: ISquareProps) {
  return (
    <div
      className={cx(
        "w-24 h-24",
        "flex justify-center items-center",
        "hover:cursor-pointer hover:bg-slate-200",
        {
          "bg-slate-100": props.index % 2 !== 0,
        }
      )}
      onClick={() => props.choose()}
    >
      <span className="font-bold text-6xl text-slate-400">{props.value}</span>
    </div>
  );
}

export default function Board() {
  const { user } = useAuth();
  const { id } = useParams();
  const [turn, setTurn] = createSignal<string | null>(null);
  const [game, { mutate }] = createResource<IGame>(async () =>
    (await fetch(`/api/games/${id}`)).json()
  );

  onMount(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_SOCKET_URL}/${id}`);

    websocket.onmessage = function (this: WebSocket, event: MessageEvent<any>) {
      mutate(JSON.parse(event.data));
    };
  });

  const takeTurn = async (index: number) => {
    await fetch(`/api/games/${id}/turn`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
  };

  createEffect(() => {
    const g = game();

    if (!g) return;

    const info = {
      x: g.state.filter((v) => v === "x").length,
      o: g.state.filter((v) => v === "o").length,
    };

    const turn = info.x <= info.o ? "x" : "o";
    const players = {
      x: g.x === g.host_id ? g.host_id : g.guest_id,
      o: g.x === g.host_id ? g.guest_id : g.host_id,
    };

    setTurn(players[turn]);
  });

  return (
    <section>
      <Status turn={turn} user={user} game={game} />
      <div className="grid grid-cols-3 border shadow-sm">
        {game()?.state.map((v, i) => (
          <Square index={i} value={v} choose={() => takeTurn(i)} />
        ))}
      </div>
    </section>
  );
}
