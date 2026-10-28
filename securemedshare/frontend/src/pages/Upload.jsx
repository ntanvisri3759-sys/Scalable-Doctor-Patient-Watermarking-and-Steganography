import { useState, useEffect } from "react";
import { patients as demoPatients } from "../data/demo.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, DemoBanner, Field, FileDrop, PageHeader, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";

const ACCEPT = ["image/png", "image/jpeg", "application/pdf"];

export default function Upload() {
  const toast = useToast();
  const [patientOptions, setPatientOptions] = useState(demoPatients);
  const [f, setF] = useState({ patient: "", title: "", type: "Medical Image", notes: "" });
  const [file, setFile] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPatients().then((data) => {
      if (Array.isArray(data) && data.length > 0) setPatientOptions(data);
    }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.patient) er.patient = "Select a patient.";
    if (f.title.trim().length < 3) er.title = "Title must be at least 3 characters.";
    if (!file) er.file = "Attach a file to upload.";
    setErrs(er);
    if (Object.keys(er).length) {
      toast("error", "Please fix the highlighted fields.");
      return;
    }
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("patient", f.patient);
      fd.append("title", f.title);
      fd.append("type", f.type);
      fd.append("notes", f.notes);
      fd.append("file", file);

      const res = await api.uploadRecord(fd);
      toast("success", `Record uploaded & hashed successfully! (ID: ${res.record.id})`);
      setF({ patient: "", title: "", type: "Medical Image", notes: "" });
      setFile(null);
    } catch (e) {
      toast("error", e.message || "Failed to upload medical record.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Upload Medical Record" subtitle="Add a report, prescription or image for a patient with automated SHA-256 integrity calculation." />
      <DemoBanner>
        Uploads are processed by the Python FastAPI backend. Files are cryptographically hashed and indexed into the records registry.
      </DemoBanner>
      <Card className="max-w-3xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Patient" error={errs.patient}>
            <select className={inputCls} value={f.patient} onChange={(e) => setF({ ...f, patient: e.target.value })}>
              <option value="">Select a patient...</option>
              {patientOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Record type">
            <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option>Medical Image</option><option>Report</option><option>Prescription</option>
            </select>
          </Field>
          <div className="sm:col-span-2"><Field label="Title" error={errs.title}><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Chest X-Ray (sample)" /></Field></div>
          <div className="sm:col-span-2"><Field label="Notes (optional)"><textarea rows={3} className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field></div>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">File</span>
            <FileDrop accept={ACCEPT} exts="PNG, JPG, PDF" maxMB={10} file={file} onFile={setFile} />
            {errs.file && <p className="mt-1 text-sm text-red-600">{errs.file}</p>}
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={busy}>Hash &amp; Upload Record</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
