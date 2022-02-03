import { render } from "solid-js/web";
import { Router as BrowserRouter } from "solid-app-router";

import AuthProvider from "./context/auth.tsx";

import Router from "./Router";

import "./index.css";

render(
  () => (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  ),
  document.getElementById("root") as HTMLElement
);
