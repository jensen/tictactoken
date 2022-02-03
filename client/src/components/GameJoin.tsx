import { useNavigate } from "solid-app-router";
import { useAuth } from "../context/auth";
import GameList from "./GameList";

interface IGameJoinProps {
  id: string;
}

export default function GameJoin(props: IGameJoinProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const join = async (event: MouseEvent) => {
    event.preventDefault();
    const game = await (
      await fetch(`/api/games/${props.id}/join`, { method: "post" })
    ).json();

    if (game.id) {
      navigate(`/games/${game.id}`);
    }
  };

  if (user && !user()) return null;

  return (
    <div
      onClick={join}
      className="rounded-full p-1 bg-green-500 flex items-center space-x-2 hover:bg-green-600"
    >
      <div className="bg-white w-8 h-8 rounded-full" />
      <div className="text-white pr-2">Join Game</div>
    </div>
  );
}
