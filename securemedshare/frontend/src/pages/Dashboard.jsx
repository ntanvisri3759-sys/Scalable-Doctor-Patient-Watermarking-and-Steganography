import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FileText, Users, ShieldCheck, Share2, Upload, Activity, UserCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { records as demoRecords, users as demoUsers, auditLogs as demoLogs, patients as demoPatients } from "../data/demo.js";
import { Button, Card, DemoBanner, PageHeader, StatCard, StatusBadge, Table, Td, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";

function RecordsTable({ rows, showPatient, patientsList }) {
  const nameOf = (id) => patientsList.find((p) => p.id === id)?.name ?? "-";
  return (
    <Table columns={["ID", "Title", ...(showPatient ? ["Patient"] : []), "Date", "Status"]}>
      {rows.map((r) => (
        <tr key={r.id}>
          <Td className="font-mono text-xs">{r.id}</Td><Td>{r.title}</Td>
          {showPatient && <Td>{nameOf(r.patientId)}</Td>}
          <Td>{r.date}</Td><Td><StatusBadge status={r.status} /></Td>
        </tr>
      ))}
    </Table>
  );
}

function DoctorDash({ recordsList, patientsList }) {
  return (
    <>
      <PageHeader title="Doctor Dashboard" subtitle="Overview of medical records and patient assignments on FastAPI backend."
        action={<Link to="/app/upload"><Button><Upload className="h-4 w-4" /> Upload record</Button></Link>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total records" value={recordsList.length} />
        <StatCard icon={Users} label="Patients" value={patientsList.length} />
        <StatCard icon={Share2} label="Active shares" value={recordsList.filter((r) => r.status === "Shared").length} />
        <StatCard icon={ShieldCheck} label="Pending processing" value={recordsList.filter((r) => r.status === "Pending").length} />
      </div>
      <Card title="Recent records" action={<Link to="/app/records" className="text-sm text-teal-600 underline">View all</Link>}>
        <RecordsTable rows={recordsList} showPatient patientsList={patientsList} />
      </Card>
    </>
  );
}

function PatientDash({ recordsList, patientsList }) {
  const mine = recordsList.filter((r) => r.patientId === "p1" && r.status === "Shared");
  return (
    <>
      <PageHeader title="Patient Dashboard" subtitle="Records shared with you via Role-Based Access Control." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Records shared with me" value={mine.length} />
        <StatCard icon={ShieldCheck} label="Protected Records" value={mine.filter((r) => r.protection?.length).length} />
        <StatCard icon={UserCheck} label="Doctors with access" value={1} />
      </div>
      <Card title="My records" action={<Link to="/app/records" className="text-sm text-teal-600 underline">View all</Link>}>
        <RecordsTable rows={mine} patientsList={patientsList} />
      </Card>
    </>
  );
}

function AdminDash({ usersList, logsList }) {
  const [q, setQ] = useState("");
  const rows = usersList.filter((u) => (u.name + u.email + u.role).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Administrator Dashboard" subtitle="System security and audit log overview." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={usersList.length} />
        <StatCard icon={UserCheck} label="Doctors" value={usersList.filter((u) => u.role === "doctor").length} />
        <StatCard icon={Activity} label="Audit events" value={logsList.length} />
        <StatCard icon={AlertTriangle} label="Denied / failed" value={logsList.filter((l) => l.result !== "Success").length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Users" action={<input className={inputCls + " !w-48"} placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />}>
          <Table columns={["Name", "Email", "Role", "Status"]} empty="No users match your search.">
            {rows.map((u) => (
              <tr key={u.id}><Td>{u.name}</Td><Td className="text-slate-500">{u.email}</Td><Td className="capitalize">{u.role}</Td><Td><StatusBadge status={u.status} /></Td></tr>
            ))}
          </Table>
        </Card>
        <Card title="Latest audit events" action={<Link to="/app/audit" className="text-sm text-teal-600 underline">Open audit history</Link>}>
          <Table columns={["Time", "Actor", "Event", "Result"]}>
            {logsList.slice(0, 6).map((l) => (
              <tr key={l.id}><Td className="text-xs">{l.time}</Td><Td>{l.actor}</Td><Td className="font-mono text-xs">{l.event}</Td><Td><StatusBadge status={l.result} /></Td></tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recordsList, setRecordsList] = useState(demoRecords);
  const [patientsList, setPatientsList] = useState(demoPatients);
  const [usersList, setUsersList] = useState(demoUsers);
  const [logsList, setLogsList] = useState(demoLogs);

  useEffect(() => {
    api.getRecords().then((d) => Array.isArray(d) && setRecordsList(d)).catch(() => {});
    if (user.role === "doctor" || user.role === "admin") {
      api.getPatients().then((d) => Array.isArray(d) && setPatientsList(d)).catch(() => {});
    }
    if (user.role === "admin") {
      api.getUsers().then((d) => Array.isArray(d) && setUsersList(d)).catch(() => {});
    }
    if (user.role === "doctor" || user.role === "admin") {
      api.getAuditLogs().then((d) => d?.items && setLogsList(d.items)).catch(() => {});
    }
  }, [user.role]);

  return (
    <>
      <DemoBanner>Connected to live Python FastAPI backend on http://127.0.0.1:8000 with real cryptographic operations.</DemoBanner>
      {user.role === "doctor" && <DoctorDash recordsList={recordsList} patientsList={patientsList} />}
      {user.role === "patient" && <PatientDash recordsList={recordsList} patientsList={patientsList} />}
      {user.role === "admin" && <AdminDash usersList={usersList} logsList={logsList} />}
    </>
  );
}
