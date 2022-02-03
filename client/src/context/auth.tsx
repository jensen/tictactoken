import type { Accessor, PropsWithChildren } from "solid-js";
import {
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";

interface IUser {
  id: string;
  username: string;
  avatar: string;
}

const AuthContext = createContext<{
  user: Accessor<IUser | null | undefined> | undefined;
}>({
  user: undefined,
});

export default function AuthProvider(props: PropsWithChildren) {
  const [user, setUser] = createSignal<IUser | null | undefined>(undefined);

  createEffect(async () => {
    const response = await fetch("/api/me", {
      credentials: "include",
    });

    if (response.status !== 200) {
      setUser(null);
      return;
    }

    const data = await response.json();

    setUser(data);
  });

  return (
    <AuthContext.Provider value={{ user }}>
      {user() !== undefined && props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
