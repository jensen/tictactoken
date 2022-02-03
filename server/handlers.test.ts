import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";
import { getWinner } from "./handlers.ts";

Deno.test("verify winner", () => {
  assertEquals(
    getWinner(["x", "x", "x", null, null, null, null, null, null]),
    "x"
  );

  assertEquals(
    getWinner([null, null, null, "x", "x", "x", null, null, null]),
    "x"
  );

  assertEquals(
    getWinner([null, null, null, null, null, null, "x", "x", "x"]),
    "x"
  );

  assertEquals(
    getWinner(["x", null, null, "x", null, null, "x", null, null]),
    "x"
  );

  assertEquals(
    getWinner([null, "x", null, null, "x", null, null, "x", null]),
    "x"
  );

  assertEquals(
    getWinner([null, null, "x", null, null, "x", null, null, "x"]),
    "x"
  );
});
