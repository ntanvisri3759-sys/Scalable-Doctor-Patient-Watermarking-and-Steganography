import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck } from "lucide-react";
import { records as demoRecords } from "../data/demo.js";
import { Button, Card, DemoBanner, Field, FileDrop, PageHeader, inputCls } from "../components/ui.jsx";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

const HASH_STATES = {
  verified: { label: "Integrity Verified", Icon: CheckCircle2, cls: "border-teal-200 bg-teal-50 text-teal-900", text: "Calculated hash matches the trusted reference." },
  mismatch: { label: "Integrity Mismatch", Icon: XCircle, cls: "border-red-200 bg-red-50 text-red-900", text: "Calculated hash differs from the trusted reference (Possible tampering)." },
  unavailable: { label: "Verification Unavailable", Icon: MinusCircle, cls: "border-amber-200 bg-amber-50 text-amber-900", text: "No trusted server-side reference exists yet." },
};

function Row({ title, children, tone = "border-slate-200 bg-white text-slate-700", Icon = MinusCircle }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${tone}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div><p className="font-semibold">{title}</p><div className="mt-1 text-sm">{children}</div></div>
    </div>
  );
}

export default function Verify() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [rec, setRec] = useState("");
  const [recordList, setRecordList] = useState(demoRecords);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getRecords().then((data) => {
      if (Array.isArray(data) && data.length > 0) setRecordList(data);
    }).catch(() => {});
  }, []);

  const runVerification = async () => {
    if (!file || !rec) return;
    setBusy(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("recordId", rec);

      const data = await api.verifyFile(fd);
      setResult(data);
      if (data.hash_match) {
        toast("success", "Cryptographic integrity verified: hash matches reference!");
      } else {
        toast("error", "Integrity mismatch: file does not match reference hash.");
      }
    } catch (e) {
      toast("error", e.message || "Verification request failed.");
    } finally {
      setBusy(false);
    }
  };

  const st = result ? HASH_STATES[result.state] || HASH_STATES.unavailable : null;

  return (
    <>
      <PageHeader title="File Verification" subtitle="Check a medical file against its trusted cryptographic reference on FastAPI backend." />
      <DemoBanner>
        Verification is evaluated on the Python FastAPI server. Computes SHA-256 checksums, cross-checks database record registries, and runs digital watermark analysis.
      </DemoBanner>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="File to verify" className="lg:col-span-2">
          <div className="space-y-4">
            <Field label="Record">
              <select className={inputCls} value={rec} onChange={(e) => setRec(e.target.value)}>
                <option value="">Select a record...</option>
                {recordList.map((r) => <option key={r.id} value={r.id}>{r.id} - {r.title}</option>)}
              </select>
            </Field>
            <FileDrop file={file} onFile={(f) => { setFile(f); setResult(null); }} exts="Any supported file" maxMB={25} />
            <Button disabled={!file || !rec} loading={busy} onClick={runVerification}>
              <ShieldCheck className="h-4 w-4" /> Run server-side verification
            </Button>
          </div>
        </Card>

        <div className="space-y-3 lg:col-span-3">
          {!result ? (
            <Card><p className="py-12 text-center text-sm text-slate-400">Results appear here. Each cryptographic check is verified separately.</p></Card>
          ) : (
            <>
              <Row title={`1. File hash comparison - ${st.label}`} tone={st.cls} Icon={st.Icon}>
                <p>{st.text}</p>
                <p className="mt-2 break-all font-mono text-xs"><b>Computed SHA-256:</b> {result.computed_hash}</p>
                {result.reference_hash && (
                  <p className="mt-1 break-all font-mono text-xs text-slate-600"><b>Reference SHA-256:</b> {result.reference_hash}</p>
                )}
              </Row>
              <Row
                title="2. Digital Watermark verification"
                tone={result.watermark_verification?.detected ? "border-teal-200 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700"}
                Icon={result.watermark_verification?.detected ? CheckCircle2 : MinusCircle}
              >
                {result.watermark_verification?.status || "Watermark check complete."}
                {result.watermark_verification?.marker && (
                  <p className="mt-1 font-mono text-xs">Extracted Marker: {result.watermark_verification.marker}</p>
                )}
              </Row>
              <Row title="3. Steganography Payload Status" Icon={MinusCircle}>
                {result.stego_extraction_status?.status || "Stego extraction requires authorized doctor key."}
              </Row>
              <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
                <p className="mb-1 font-semibold text-slate-700">Security Guarantee</p>
                A matching SHA-256 hash mathematically proves that not a single bit of the file has been altered or tampered with since creation.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
