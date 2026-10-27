"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { EASE } from "./ui";
const LINKS = [
    { href: "/review", label: "Review desk" },
    { href: "/graph", label: "Faculty graph" },
    { href: "/rules", label: "Handbook rules" },
    { href: "/map", label: "National map" },
    { href: "/inspect", label: "Virtual inspection" },
    { href: "/audit", label: "Audit chain" },
    { href: "/about", label: "Why MARK" },
];
export function useRole() {
    const [role, setRole] = useState("Reviewer");
    useEffect(() => {
        try {
            const r = localStorage.getItem("mark.role");
            if (r)
                setRole(r);
        }
        catch { }
        const on = () => { try {
            setRole(localStorage.getItem("mark.role") || "Reviewer");
        }
        catch { } };
        window.addEventListener("mark:role", on);
        return () => window.removeEventListener("mark:role", on);
    }, []);
    return role;
}
export default function Shell({ children }) {
    const path = usePathname();
    const home = path === "/";
    const role = useRole();
    const router = useRouter();
    const back = () => { if (window.history.length > 1)
        router.back();
    else
        router.push("/review"); };
    return (<>
      {!home && (<header className="no-print fixed inset-x-0 top-0 z-50">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 pt-3 md:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" className="btn btn-sm whitespace-nowrap" onClick={back} aria-label="Go back">← Back</button>
              <Link href="/" className="flex items-center gap-3 pl-1" aria-label="MARK home">
                <Logo className="h-7 w-auto"/>
                <span className="hidden flex-col leading-tight 2xl:flex">
                  <span className="kicker" style={{ fontSize: "0.58rem" }}>Approval intelligence for AICTE</span>
                </span>
              </Link>
            </div>
            <nav aria-label="Primary" className="sheet hidden items-center gap-0.5 rounded-full p-1 xl:flex">
              {LINKS.map((l) => {
                const active = path === l.href || path.startsWith(l.href + "/");
                return (<Link key={l.href} href={l.href} className="tab !px-3 !text-[13px]" data-active={active}>{l.label}</Link>);
            })}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/settings" className="badge badge-ink hidden 2xl:inline-flex" title="Change role in settings">{role}</Link>
              <Link href="/precheck" className="btn btn-accent btn-sm whitespace-nowrap">Run a pre-check</Link>
            </div>
          </div>
          {/* below 1280px the same options sit in a tab strip, always visible, scrollable on a phone */}
          <div className="mx-auto max-w-[1400px] px-4 pt-2 md:px-6 xl:hidden">
            <nav aria-label="Sections" className="sheet scroll-x flex items-center gap-0.5 rounded-full p-1">
              {LINKS.concat({ href: "/settings", label: "Settings" }).map((l) => {
                const active = path === l.href || path.startsWith(l.href + "/");
                return (<Link key={l.href} href={l.href} className="tab !px-3 !text-[13px]" data-active={active}>{l.label}</Link>);
            })}
            </nav>
          </div>
        </header>)}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={path} className={`relative z-10 ${home ? "" : "mx-auto max-w-[1400px] px-4 pb-20 pt-32 md:px-8 xl:pt-28"}`} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={{ duration: 0.35, ease: EASE }}>
          {children}
        </motion.div>
      </AnimatePresence>
      {!home && (<footer className="no-print relative z-10 mx-auto max-w-[1400px] px-4 pb-8 md:px-8">
          <div className="rule mb-4"/>
          <div className="mono flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">
            <span>MARK · Approval intelligence for AICTE</span>
            <span>Every decision is signed to the audit chain.</span>
          </div>
        </footer>)}
    </>);
}
