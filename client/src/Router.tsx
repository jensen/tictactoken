import { Suspense } from "solid-js";
import { Routes, Route } from "solid-app-router";

import Layout from "./Layout";
import Board from "./components/GameBoard";

import Index from "./pages/Index";
import ViewGame from "./pages/ViewGame";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<div>Loading</div>}>
              <Index />
            </Suspense>
          }
        />
        <Route path="games">
          <Route
            path=":id"
            element={
              <Suspense fallback={<div>Loading</div>}>
                <ViewGame />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
