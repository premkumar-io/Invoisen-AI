import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Sparkles,
  CreditCard,
  Send,
  AlertTriangle,
  FileCheck2,
  Trash2,
  Receipt,
} from "lucide-react";
import { type ThemeName } from "@/lib/theme";
import {
  getStoredNotifications,
  saveStoredNotifications,
  formatTimeAgo,
  type NotificationItem,
} from "@/lib/notifications";

interface NotificationCenterProps {
  theme: ThemeName;
}

export function NotificationCenter({ theme }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "ai">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    setNotifications(getStoredNotifications());

    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<NotificationItem[]>;
      if (customEvt.detail) {
        setNotifications(customEvt.detail);
      } else {
        setNotifications(getStoredNotifications());
      }
    };

    const handleStorage = () => {
      setNotifications(getStoredNotifications());
    };

    window.addEventListener("invoisen_notif_updated", handleUpdate);
    window.addEventListener("storage", handleStorage);

    const timer = setInterval(() => {
      setNotifications(getStoredNotifications());
    }, 5000);

    return () => {
      window.removeEventListener("invoisen_notif_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(timer);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const markItemAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "ai") return n.type === "ai";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "payment":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case "ai":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case "reminder":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "invoice":
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        );
    }
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
    <div ref={popoverRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${
          theme === "purple"
            ? "bg-purple-200/80 hover:bg-purple-300/80 border-purple-300 text-purple-950"
            : theme === "dark"
              ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white"
              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
        }`}
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white font-black text-[10px] flex items-center justify-center ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 top-12 z-50 w-80 sm:w-96 p-3.5 rounded-3xl border backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 ${getPopoverBgClass()}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h4 className="font-headline text-sm font-bold">Live Activity Feeds</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 mb-3 rounded-2xl bg-muted/60 text-xs font-semibold">
              {(["all", "unread", "ai"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-1 py-1 rounded-xl capitalize text-center transition-all cursor-pointer ${
                    filter === t
                      ? "bg-card text-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <FileCheck2 className="w-6 h-6 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  No notifications to display.
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markItemAsRead(item.id)}
                    className={`group relative p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      item.read
                        ? "bg-transparent border-border/40 opacity-70"
                        : theme === "dark"
                          ? "bg-slate-900/90 border-primary/30 ring-1 ring-primary/20"
                          : theme === "purple"
                            ? "bg-purple-200/60 border-purple-300"
                            : "bg-card border-primary/30 ring-1 ring-primary/20 shadow-sm"
                    }`}
                  >
                    {getIcon(item.type)}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs truncate text-foreground">{item.title}</h5>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                          {item.createdAt ? formatTimeAgo(item.createdAt) : item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 font-medium">
                        {item.message}
                      </p>
                    </div>
                    <button
                      onClick={(e) => clearNotification(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer"
                      title="Clear notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
