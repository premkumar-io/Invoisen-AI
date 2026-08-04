import React, { useState } from "react";
import { Building2, Check, Plus, ChevronDown } from "lucide-react";
import { type ThemeName } from "@/lib/theme";

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

const defaultWorkspaces: Workspace[] = [
  { id: "ws-1", name: "Invoisen Studio", plan: "Pro Agency" },
  { id: "ws-2", name: "Swiss Ops GmbH", plan: "Enterprise" },
  { id: "ws-3", name: "Personal Billing", plan: "Starter" },
];

interface WorkspaceSwitcherProps {
  theme: ThemeName;
}

export function WorkspaceSwitcher({ theme }: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(defaultWorkspaces[0]);
  const [open, setOpen] = useState(false);

  const selectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setOpen(false);
  };

  const getPopoverBgClass = () => {
    if (theme === "purple") {
      return "bg-purple-100/95 border-purple-300 text-purple-950 shadow-2xl shadow-purple-900/20";
    }
    if (theme === "dark") {
      return "bg-slate-950/95 border-slate-800 text-white shadow-2xl shadow-black/80";
    }
    return "bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-300/60";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
          theme === "purple"
            ? "bg-purple-200/60 hover:bg-purple-200 border-purple-300 text-purple-950"
            : theme === "dark"
              ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white"
              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
        }`}
        title="Switch Workspace"
      >
        <Building2 className="w-3.5 h-3.5 text-primary" />
        <span className="max-w-[110px] truncate">{activeWorkspace.name}</span>
        <ChevronDown
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 top-12 z-50 w-56 p-2 rounded-2xl border backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 ${getPopoverBgClass()}`}
          >
            <div className="px-3 py-1.5 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Workspaces
            </div>

            <div className="space-y-1">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => selectWorkspace(ws)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? theme === "purple"
                          ? "bg-purple-200/90 text-purple-950 font-bold"
                          : theme === "dark"
                            ? "bg-slate-900 text-white font-bold"
                            : "bg-slate-100 text-slate-900 font-bold"
                        : "hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="truncate">{ws.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {ws.plan}
                      </span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="my-1 border-t border-border/40" />

            <button
              onClick={() => {
                setOpen(false);
                alert("Multi-workspace creation unlocked in Pro Studio!");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workspace</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
