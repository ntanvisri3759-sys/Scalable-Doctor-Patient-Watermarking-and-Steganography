import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { patients as demoPatients, records as demoRecords } from "../data/demo.js";
import { Badge, Button, Card, DemoBanner, Modal, PageHeader, StatusBadge, Table, Td, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";

export default function Records() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [sel, setSel] = useState(null);
  const [recordsList, setRecordsList] = useState(demoRecords);
  const [patientsList, setPatientsList] = useState(demoPatients);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.getRecords({ q, type, status }).catch(() => null),
      api.getPatients().catch(() => null),
    ]).then(([recData, patData]) => {
      if (!mounted) return;
      if (Array.isArray(recData)) {
        setRecordsList(recData);
      } else {
        // Fallback filtering if API offline
        const base = user.role === "patient" ? demoRecords.filter((r) => r.patientId === "p1" && r.status === "Shared") : demoRecords;
        setRecordsList(base.filter((r) =>
          (type === "All" || r.type === type) &&
          (status === "All" || r.status === status) &&
          (r.title + r.id).toLowerCase().includes(q.toLowerCase())
        ));
      }
      if (Array.isArray(patData)) setPatientsList(patData);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [q, type, status, user.role]);

  const nameOf = (id) => patientsList.find((p) => p.id === id)?.name ?? "-";

  return (
    <>
      <PageHeader title="Medical Records" subtitle={user.role === "patient" ? "Records shared with you." : "All records you manage."} />
      <DemoBanner>Live records registry managed by FastAPI backend with SHA-256 cryptographic hashes and access policies.</DemoBanner>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input className={inputCls + " !w-64"} placeholder="Search by title, ID or patient" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls + " !w-44"} value={type} onChange={(e) => setType(e.target.value)}>
            {["All", "Medical Image", "Report", "Prescription"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={inputCls + " !w-40"} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Shared", "Private", "Pending", "Revoked"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Table columns={["ID", "Title", "Type", ...(user.role === "doctor" ? ["Patient"] : []), "Date", "Status", ""]} empty={loading ? "Loading records..." : "No records match your filters."}>
          {recordsList.map((r) => (
            <tr key={r.id}>
              <Td className="font-mono text-xs">{r.id}</Td><Td>{r.title}</Td><Td>{r.type}</Td>
              {user.role === "doctor" && <Td>{nameOf(r.patientId)}</Td>}
              <Td>{r.date}</Td><Td><StatusBadge status={r.status} /></Td>
              <Td><Button size="sm" variant="outline" onClick={() => setSel(r)}><Eye className="h-4 w-4" /> Details</Button></Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.title} footer={
        <div className="flex w-full items-center justify-between">
          {sel?.filePath ? (
            <a
              href={`http://127.0.0.1:8000/api/records/${sel.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Download className="h-3.5 w-3.5" /> Download original file
            </a>
          ) : <span />}
          <Button variant="outline" onClick={() => setSel(null)}>Close</Button>
        </div>
      }>
        {sel && (
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-slate-500">Record ID</dt><dd className="col-span-2 font-mono">{sel.id}</dd>
            <dt className="text-slate-500">Type</dt><dd className="col-span-2">{sel.type}</dd>
            <dt className="text-slate-500">Patient</dt><dd className="col-span-2">{nameOf(sel.patientId)}</dd>
            <dt className="text-slate-500">Uploaded</dt><dd className="col-span-2">{sel.date}</dd>
            <dt className="text-slate-500">Size</dt><dd className="col-span-2">{sel.size}</dd>
            <dt className="text-slate-500">Status</dt><dd className="col-span-2"><StatusBadge status={sel.status} /></dd>
            <dt className="text-slate-500">SHA-256 Hash</dt><dd className="col-span-2 break-all font-mono text-xs text-slate-700">{sel.hash || "Not computed"}</dd>
            {sel.watermarkMarker && (
              <>
                <dt className="text-slate-500">Watermark</dt>
                <dd className="col-span-2 font-mono text-xs text-teal-700">{sel.watermarkMarker}</dd>
              </>
            )}
            <dt className="text-slate-500">Protections</dt>
            <dd className="col-span-2 flex flex-wrap gap-1">{(sel.protection || []).map((p) => <Badge key={p} tone="navy">{p}</Badge>)}</dd>
          </dl>
        )}
      </Modal>
    </>
  );
}
