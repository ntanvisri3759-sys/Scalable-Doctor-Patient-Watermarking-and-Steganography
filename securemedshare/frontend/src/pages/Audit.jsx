import { useEffect, useState } from "react";
import { auditLogs as initial, eventTypes as initialEventTypes } from "../data/demo.js";
import { Button, Card, DemoBanner, PageHeader, StatusBadge, Table, Td, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";

const PAGE = 6;

export default function Audit() {
  const [logs, setLogs] = useState(initial);
  const [eventTypes, setEventTypes] = useState(initialEventTypes);
  const [q, setQ] = useState("");
  const [event, setEvent] = useState("All");
  const [result, setResult] = useState("All");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getAuditLogs()
      .then((res) => {
        if (res && res.items) {
          setLogs(res.items);
          if (res.event_types) setEventTypes(res.event_types);
        }
      })
      .catch(() => {});
  }, []);

  const rows = logs.filter((l) =>
    l.actor.toLowerCase().includes(q.toLowerCase()) &&
    (event === "All" || l.event === event) &&
    (result === "All" || l.result === result) &&
    (!date || l.time.startsWith(date))
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages);
  const view = rows.slice((cur - 1) * PAGE, cur * PAGE);
  const set = (fn) => (e) => { fn(e.target.value); setPage(1); };

  return (
    <>
      <PageHeader title="Audit History" subtitle="Append-only record of system security and cryptographic events on FastAPI backend." />
      <DemoBanner>
        All operations (login, upload, watermarking, steganography, verification, permission changes) are immutably logged on the server.
      </DemoBanner>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input className={inputCls + " !w-56"} placeholder="Filter by user" value={q} onChange={set(setQ)} />
          <select className={inputCls + " !w-52"} value={event} onChange={set(setEvent)}>{["All", ...eventTypes].map((t) => <option key={t}>{t}</option>)}</select>
          <select className={inputCls + " !w-36"} value={result} onChange={set(setResult)}>{["All", "Success", "Failure", "Denied", "Mismatch"].map((t) => <option key={t}>{t}</option>)}</select>
          <input type="date" className={inputCls + " !w-44"} value={date} onChange={set(setDate)} />
        </div>
        <Table columns={["Time", "Actor", "Event", "Resource", "Result"]} empty="No events match your filters.">
          {view.map((l) => (
            <tr key={l.id}><Td className="text-xs">{l.time}</Td><Td>{l.actor}</Td><Td className="font-mono text-xs">{l.event}</Td><Td className="font-mono text-xs">{l.resource}</Td><Td><StatusBadge status={l.result} /></Td></tr>
          ))}
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{rows.length} events - page {cur} of {pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
