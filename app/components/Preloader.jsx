"use client";
import { useEffect } from "react";
export function whenReady(fn) {
    if (typeof window === "undefined")
        return () => { };
    if (window.__markReady) {
        fn();
        return () => { };
    }
    const on = () => fn();
    window.addEventListener("mark:ready", on, { once: true });
    return () => window.removeEventListener("mark:ready", on);
}
export default function Preloader() {
    useEffect(() => { window.__markReady = true; window.dispatchEvent(new Event("mark:ready")); }, []);
    return null;
}
