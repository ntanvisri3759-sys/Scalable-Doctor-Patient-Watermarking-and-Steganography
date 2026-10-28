import { useState } from "react";
import { Bell } from "lucide-react";
import { notifications as initial } from "../data/demo.js";
import { Button, Card, PageHeader, cx } from "../components/ui.jsx";

export default function Notifications() {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread (sample data)`}
        action={<Button variant="outline" disabled={!unread} onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}>Mark all as read</Button>} />
      <Card className="max-w-3xl">
        <ul className="divide-y divide-slate-100">
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-3">
              <div className={cx("mt-1 rounded-full p-2 transition", n.read ? "bg-[#F3F2F0] text-[#9E9A92]" : "bg-[#E6E0F0] text-[#6F4E37] ring-1 ring-[#D6CCEA]")}><Bell className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className={cx("text-sm", n.read ? "text-slate-600" : "font-semibold text-[#332216]")}>{n.title}</p>
                <p className="text-sm text-slate-500">{n.body}</p>
                <p className="text-xs text-slate-400">{n.time}</p>
              </div>
              {!n.read && <Button size="sm" variant="ghost" onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>Mark read</Button>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
