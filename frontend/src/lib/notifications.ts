import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  createdAt: number;
  type: "payment" | "ai" | "reminder" | "alert" | "invoice";
  read: boolean;
}

const STORAGE_KEY = "invoisen_notifications_v1";

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Invoice #INV-2026-089 Paid",
    message: "Orbit Collective paid $14,200.00 via Stripe processing.",
    time: "4m ago",
    createdAt: Date.now() - 4 * 60 * 1000,
    type: "payment",
    read: false,
  },
  {
    id: "notif-2",
    title: "AI Client Research Ready",
    message: "Nexus Studios entity verification & tax profile compiled.",
    time: "20m ago",
    createdAt: Date.now() - 20 * 60 * 1000,
    type: "ai",
    read: false,
  },
  {
    id: "notif-3",
    title: "Overdue Reminder Sent",
    message: "Polite AI payment reminder dispatched to billing@stratus.com.",
    time: "1h ago",
    createdAt: Date.now() - 60 * 60 * 1000,
    type: "reminder",
    read: false,
  },
];

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return initialNotifications;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return initialNotifications;
  }
}

export function saveStoredNotifications(notifications: NotificationItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Ignore error
  }
}

export function pushNotification(payload: {
  title: string;
  message: string;
  type?: NotificationItem["type"];
  notifyToast?: boolean;
}) {
  if (typeof window === "undefined") return;

  const newItem: NotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: payload.title,
    message: payload.message,
    time: "Just now",
    createdAt: Date.now(),
    type: payload.type || "invoice",
    read: false,
  };

  const current = getStoredNotifications();
  const updated = [newItem, ...current.slice(0, 24)];
  saveStoredNotifications(updated);

  window.dispatchEvent(new CustomEvent("invoisen_notif_updated", { detail: updated }));

  if (payload.notifyToast !== false) {
    if (payload.type === "payment") {
      toast.success(payload.title, { description: payload.message });
    } else if (payload.type === "ai") {
      toast.info(payload.title, { description: payload.message });
    } else if (payload.type === "alert") {
      toast.error(payload.title, { description: payload.message });
    } else {
      toast.info(payload.title, { description: payload.message });
    }
  }
}

export function formatTimeAgo(createdAt: number): string {
  const diffSec = Math.floor((Date.now() - createdAt) / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
