import { Outlet } from "solid-app-router";
import LoginButton from "./components/common/LoginButton";

export default function Layout() {
  return (
    <main className="h-full flex flex-col">
      <header className="px-4 py-2 bg-slate-800 flex justify-center">
        <div className="text-white font-bold">tic/tac/token</div>
      </header>
      <section className="py-4 flex justify-center">
        <LoginButton />
      </section>
      <section className="flex-1 flex justify-center items-center">
        <Outlet />
      </section>
    </main>
  );
}
