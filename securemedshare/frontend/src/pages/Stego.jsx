import { useEffect, useState } from "react";
import { EyeOff, Download, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, DemoBanner, Field, FileDrop, PageHeader, useObjectUrl, inputCls, cx } from "../components/ui.jsx";
import { api } from "../services/api.js";

const HEADER_BYTES = 16;
const ENC_OVERHEAD = 12 + 16;

export default function Stego() {
  const toast = useToast();
  const [tab, setTab] = useState("hide");
  const [file, setFile] = useState(null);
  const [xfile, setXfile] = useState(null);
  const [msg, setMsg] = useState("");
  const [passphrase, setPassphrase] = useState("SecureMedShareDefaultAesKey2026!");
  const [encrypt, setEncrypt] = useState(true);
  const [dim, setDim] = useState(null);
  const [busy, setBusy] = useState(false);
  const [xbusy, setXbusy] = useState(false);
  const [stegoResult, setStegoResult] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const url = useObjectUrl(file);

  useEffect(() => {
    if (!url) { setDim(null); return; }
    const im = new Image();
    im.onload = () => setDim({ w: im.naturalWidth, h: im.naturalHeight });
    im.src = url;
  }, [url]);

  const capacity = dim ? Math.max(0, Math.floor((dim.w * dim.h * 3) / 8) - HEADER_BYTES - (encrypt ? ENC_OVERHEAD : 0)) : 0;
  const used = new TextEncoder().encode(msg).length;
  const tooBig = dim && used > capacity;
  const pct = capacity ? Math.min(100, (used / capacity) * 100) : 0;

  const runEncode = async () => {
    if (!file || !msg) return;
    setBusy(true);
    setStegoResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("message", msg);
      fd.append("passphrase", passphrase);
      fd.append("encrypt", encrypt);

      const res = await api.hideStego(fd);
      setStegoResult(res);
      toast("success", `Message embedded with ${encrypt ? "AES-256-GCM encryption" : "plaintext"}!`);
    } catch (e) {
      toast("error", e.message || "Failed to encode message.");
    } finally {
      setBusy(false);
    }
  };

  const runExtract = async () => {
    if (!xfile) return;
    setXbusy(true);
    setExtractedData(null);

    try {
      const fd = new FormData();
      fd.append("file", xfile);
      fd.append("passphrase", passphrase);

      const res = await api.extractStego(fd);
      setExtractedData(res);
      toast("success", "Payload successfully extracted and decrypted!");
    } catch (e) {
      toast("error", e.message || "Extraction failed.");
    } finally {
      setXbusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Steganography" subtitle="Hide or extract encrypted medical payloads using LSB encoding in lossless images." />
      <DemoBanner>
        FastAPI backend active on <b>http://127.0.0.1:8000</b>. Payloads are encrypted with authenticated <b>AES-256-GCM</b> before embedding in image pixel bit-planes.
      </DemoBanner>
      <div className="mb-4 flex gap-2">
        {[["hide", "Hide information"], ["extract", "Extract information"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("rounded-lg px-4 py-2 text-sm font-medium", tab === k ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>{l}</button>
        ))}
      </div>

      {tab === "hide" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Cover image">
            <FileDrop accept={["image/png"]} exts="PNG only (lossless)" maxMB={10} file={file} onFile={(f) => { setFile(f); setStegoResult(null); }} label="Choose a PNG image" />
            {url && <img src={url} alt="Cover" className="mt-4 max-h-56 w-full rounded-lg bg-slate-100 object-contain" />}
            {dim && <p className="mt-2 text-sm text-slate-600">{dim.w} x {dim.h} px - estimated capacity: <b>{capacity.toLocaleString()} bytes</b></p>}
            <p className="mt-2 text-xs text-slate-500">JPEG is not supported because lossy compression destroys LSB data.</p>
          </Card>
          <Card title="Secret Payload">
            <div className="space-y-4">
              <Field label="Secret medical payload / diagnosis reference">
                <textarea rows={4} className={inputCls} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Enter confidential patient diagnosis or prescription" />
              </Field>
              <Field label="Encryption key / passphrase">
                <input className={inputCls} type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
              </Field>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" className="mt-1" checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} />
                <span>Encrypt payload with AES-256-GCM before embedding.</span>
              </label>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={cx("h-full", tooBig ? "bg-red-500" : "bg-teal-500")} style={{ width: `${pct}%` }} />
                </div>
                <p className={cx("mt-1 text-xs", tooBig ? "text-red-600" : "text-slate-500")}>
                  {used} bytes{dim ? ` of ${capacity.toLocaleString()} available` : ""}{tooBig ? " - message is too large for this image." : ""}
                </p>
              </div>
              <Button disabled={!file || !used || tooBig} loading={busy} onClick={runEncode}>
                <EyeOff className="h-4 w-4" /> Encode &amp; Encrypt Message
              </Button>

              {stegoResult && (
                <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-teal-900">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                    Stego-image generated successfully!
                  </div>
                  <p className="mt-1 text-xs text-teal-800">
                    Embedded {stegoResult.stats.embedded_bytes} bytes in PNG carrier ({stegoResult.stats.encrypted ? "AES-256-GCM encrypted" : "Plaintext"}).
                  </p>
                  <a href={stegoResult.data_url} download="stego_medical_image.png" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 underline">
                    <Download className="h-3.5 w-3.5" /> Download stego-image PNG
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card title="Extract from a stego-image" className="max-w-2xl">
          <div className="space-y-4">
            <FileDrop accept={["image/png"]} exts="PNG only" maxMB={10} file={xfile} onFile={(f) => { setXfile(f); setExtractedData(null); }} label="Choose a stego PNG" />
            <Field label="Decryption passphrase">
              <input className={inputCls} type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
            </Field>
            <Button disabled={!xfile} loading={xbusy} onClick={runExtract}>
              Extract &amp; Decrypt Message
            </Button>

            {extractedData && (
              <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-teal-900">
                  <Lock className="h-5 w-5 text-teal-600" />
                  Decrypted Medical Payload ({extractedData.cipher_algorithm || "Authenticated"})
                </div>
                <div className="mt-2 rounded bg-white p-3 font-mono text-sm text-slate-800 border border-slate-200">
                  {extractedData.message}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
