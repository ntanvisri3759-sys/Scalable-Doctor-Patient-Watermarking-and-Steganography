import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, Info, Loader2, FileCheck2 } from "lucide-react";

export const cx = (...a) => a.filter(Boolean).join(" ");
export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export function Button({ variant = "primary", size = "md", loading = false, className = "", children, ...p }) {
  const v = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    navy: "bg-navy-900 text-white hover:bg-navy-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100",
  }[variant];
  const s = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" }[size];
  return (
    <button
      {...p}
      disabled={loading || p.disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        v, s, className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-navy-900">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const tones = {
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
  navy: "bg-navy-50 text-navy-700 ring-navy-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};
export function Badge({ tone = "slate", children }) {
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}
const statusTone = { Shared: "teal", Active: "teal", Success: "teal", Private: "slate", Pending: "amber", Revoked: "red", Suspended: "red", Failure: "red", Denied: "red" };
export const StatusBadge = ({ status }) => <Badge tone={statusTone[status] || "slate"}>{status}</Badge>;

export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-teal-50 p-3 text-teal-700"><Icon className="h-6 w-6" /></div>
      <div>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBanner({ children }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Table({ columns, children, empty = "No data found." }) {
  const rows = Array.isArray(children) ? children.length : children ? 1 : 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>{columns.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {rows === 0 && <p className="py-8 text-center text-sm text-slate-400">{empty}</p>}
    </div>
  );
}
export const Td = ({ children, className = "" }) => <td className={cx("px-3 py-3 align-middle", className)}>{children}</td>;

export function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

// Client-side validation is a UX convenience only. The server must re-validate in Phase 2.
export function FileDrop({ accept = [], exts = "", maxMB = 10, file, onFile, label = "Click to choose a file or drag it here" }) {
  const ref = useRef(null);
  const [err, setErr] = useState("");
  const pick = (f) => {
    if (!f) return;
    if (accept.length && !accept.includes(f.type)) {
      setErr(`Unsupported file type${f.type ? ` (${f.type})` : ""}. Allowed: ${exts}.`);
      onFile(null);
      return;
    }
    if (f.size > maxMB * 1024 * 1024) {
      setErr(`File is larger than the ${maxMB} MB limit.`);
      onFile(null);
      return;
    }
    setErr("");
    onFile(f);
  };
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-teal-500 hover:bg-teal-50/40"
      >
        {file ? <FileCheck2 className="h-8 w-8 text-teal-600" /> : <UploadCloud className="h-8 w-8 text-slate-400" />}
        <p className="text-sm font-medium text-slate-700">{file ? file.name : label}</p>
        <p className="text-xs text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : `${exts} - up to ${maxMB} MB`}</p>
        <input ref={ref} type="file" className="hidden" accept={accept.join(",")} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}
