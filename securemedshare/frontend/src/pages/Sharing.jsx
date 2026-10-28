import { useEffect, useState } from "react";
import { Plus, Ban } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { patients as demoPatients, permissions as initial, records as demoRecords } from "../data/demo.js";
import { Button, Card, DemoBanner, Field, Modal, PageHeader, StatusBadge, Table, Td, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";

export default function Sharing() {
  const { user } = useAuth();
  const toast = useToast();
  const isDoctor = user.role === "doctor";
  const [perms, setPerms] = useState(initial);
  const [recordsList, setRecordsList] = useState(demoRecords);
  const [patientsList, setPatientsList] = useState(demoPatients);
  const [grant, setGrant] = useState(false);
  const [revoke, setRevoke] = useState(null);
  const [f, setF] = useState({ patient: "", record: "", expires: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPermissions()
      .then((data) => {
        if (data && Array.isArray(data)) setPerms(data);
      })
      .catch(() => {});
    api.getRecords()
      .then((data) => {
        if (data && Array.isArray(data)) setRecordsList(data);
      })
      .catch(() => {});
    api.getPatients()
      .then((data) => {
        if (data && Array.isArray(data)) setPatientsList(data);
      })
      .catch(() => {});
  }, []);

  const pName = (id) => patientsList.find((p) => p.id === id)?.name ?? "-";
  const rTitle = (id) => recordsList.find((r) => r.id === id)?.title ?? "-";

  const rows = isDoctor ? perms : perms.filter((p) => p.patientId === "p1");

  const submitGrant = async () => {
    if (!f.patient || !f.record || !f.expires) return setErr("Select a patient, a record and an expiry date.");
    setBusy(true);
    try {
      const res = await api.grantPermission({ patientId: f.patient, recordId: f.record, expires: f.expires });
      setPerms([res.permission, ...perms]);
      setGrant(false);
      setErr("");
      setF({ patient: "", record: "", expires: "" });
      toast("success", "Permission granted and recorded on FastAPI backend!");
    } catch (e) {
      toast("error", e.message || "Failed to grant permission.");
    } finally {
      setBusy(false);
    }
  };

  const doRevoke = async () => {
    if (!revoke) return;
    try {
      await api.revokePermission(revoke.id);
      setPerms(perms.map((p) => (p.id === revoke.id ? { ...p, status: "Revoked" } : p)));
      setRevoke(null);
      toast("success", `Permission ${revoke.id} revoked on server.`);
    } catch (e) {
      toast("error", e.message || "Failed to revoke permission.");
    }
  };

  return (
    <>
      <PageHeader
        title="Sharing & Permissions"
        subtitle={isDoctor ? "Grant or revoke patient access to records." : "Records you currently have access to."}
        action={isDoctor && <Button onClick={() => setGrant(true)}><Plus className="h-4 w-4" /> Grant access</Button>}
      />
      <DemoBanner>
        Permissions are enforced via Role-Based Access Control (RBAC) on the Python FastAPI server. Expired or revoked permissions deny patient access.
      </DemoBanner>
      <Card>
        <Table columns={["Permission", "Record", ...(isDoctor ? ["Patient"] : []), "Granted", "Expires", "Status", ...(isDoctor ? [""] : [])]} empty="No permissions to show.">
          {rows.map((p) => (
            <tr key={p.id}>
              <Td className="font-mono text-xs">{p.id}</Td><Td>{p.recordId} - {rTitle(p.recordId)}</Td>
              {isDoctor && <Td>{pName(p.patientId)}</Td>}
              <Td>{p.granted}</Td><Td>{p.expires}</Td><Td><StatusBadge status={p.status} /></Td>
              {isDoctor && <Td>{p.status === "Active" && <Button size="sm" variant="outline" onClick={() => setRevoke(p)}><Ban className="h-4 w-4" /> Revoke</Button>}</Td>}
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={grant} onClose={() => setGrant(false)} title="Grant access"
        footer={<><Button variant="outline" onClick={() => setGrant(false)}>Cancel</Button><Button loading={busy} onClick={submitGrant}>Grant</Button></>}>
        <div className="space-y-4">
          <Field label="Patient"><select className={inputCls} value={f.patient} onChange={(e) => setF({ ...f, patient: e.target.value })}><option value="">Select...</option>{patientsList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Record"><select className={inputCls} value={f.record} onChange={(e) => setF({ ...f, record: e.target.value })}><option value="">Select...</option>{recordsList.map((r) => <option key={r.id} value={r.id}>{r.id} - {r.title}</option>)}</select></Field>
          <Field label="Access expires on"><input type="date" className={inputCls} value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      </Modal>

      <Modal open={!!revoke} onClose={() => setRevoke(null)} title="Revoke access?"
        footer={<><Button variant="outline" onClick={() => setRevoke(null)}>Cancel</Button><Button variant="danger" onClick={doRevoke}>Revoke</Button></>}>
        <p className="text-sm text-slate-600">{revoke && `${pName(revoke.patientId)} will lose access to ${revoke.recordId}.`}</p>
      </Modal>
    </>
  );
}
