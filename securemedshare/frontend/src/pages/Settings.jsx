import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, DemoBanner, Field, PageHeader, inputCls } from "../components/ui.jsx";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [notif, setNotif] = useState({ shared: true, verify: true, security: true });
  const [pe, setPe] = useState({});
  const [we, setWe] = useState({});

  const saveProfile = (e) => {
    e.preventDefault();
    const er = {};
    if (p.name.trim().length < 2) er.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) er.email = "Enter a valid email.";
    setPe(er);
    if (!Object.keys(er).length) {
      if (updateUser) updateUser({ name: p.name, email: p.email });
      toast("success", "Profile updated successfully!");
    }
  };
  const savePw = (e) => {
    e.preventDefault();
    const er = {};
    if (!pw.current) er.current = "Enter your current password.";
    if (pw.next.length < 8) er.next = "New password must be at least 8 characters.";
    if (pw.next !== pw.confirm) er.confirm = "Passwords do not match.";
    setWe(er);
    if (!Object.keys(er).length) {
      toast("success", "Password updated successfully in your active session.");
      setPw({ current: "", next: "", confirm: "" });
    }
  };

  return (
    <>
      <PageHeader title="Profile & Settings" subtitle={`Signed in as ${user.role}.`} />
      <DemoBanner>Settings are not saved yet.</DemoBanner>
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <Card title="Profile">
          <form onSubmit={saveProfile} className="space-y-4" noValidate>
            <Field label="Full name" error={pe.name}><input className={inputCls} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
            <Field label="Email" error={pe.email}><input className={inputCls} value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></Field>
            <Field label="Role"><input className={inputCls + " bg-slate-50 capitalize"} value={user.role} disabled /></Field>
            <Button type="submit">Save profile</Button>
          </form>
        </Card>
        <Card title="Change password">
          <form onSubmit={savePw} className="space-y-4" noValidate>
            <Field label="Current password" error={we.current}><input type="password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label="New password" error={we.next}><input type="password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="Confirm new password" error={we.confirm}><input type="password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            <Button type="submit" variant="navy">Update password</Button>
          </form>
        </Card>
        <Card title="Notification preferences" className="lg:col-span-2">
          {[["shared", "When a record is shared or revoked"], ["verify", "When a verification finishes"], ["security", "Security alerts (new sign-ins)"]].map(([k, l]) => (
            <label key={k} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0">
              {l}<input type="checkbox" checked={notif[k]} onChange={() => setNotif({ ...notif, [k]: !notif[k] })} />
            </label>
          ))}
        </Card>
      </div>
    </>
  );
}
