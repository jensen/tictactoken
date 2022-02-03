import { useAuth } from "../context/auth";

interface IGameCreateProps {
  onNewGame: (game: IGame) => void;
}

export default function GameCreate(props: IGameCreateProps) {
  const { user } = useAuth();

  if (user && !user()) return null;

  const create = async () => {
    const game = await (
      await fetch("/api/games", {
        method: "post",
      })
    ).json();
  };

  return (
    <section className="py-4 flex justify-center">
      <button
        className="px-4 py-2 text-white bg-blue-400 rounded-full hover:bg-blue-500"
        onClick={create}
      >
        Create New Game
      </button>
    </section>
  );
}
