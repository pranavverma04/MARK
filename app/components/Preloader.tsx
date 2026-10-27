"use client";

import { useEffect } from "react";

/** The opening no longer uses a splash: the name appears straight away. This keeps the ready signal for anything that waits on it. */
declare global {
  interface Window { __markReady?: boolean }
}
export function whenReady(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  if (window.__markReady) { fn(); return () => {}; }
  const on = () => fn();
  window.addEventListener("mark:ready", on, { once: true });
  return () => window.removeEventListener("mark:ready", on);
}
export default function Preloader() {
  useEffect(() => { window.__markReady = true; window.dispatchEvent(new Event("mark:ready")); }, []);
  return null;
}
