import { useState } from "react";
import { Stamp, Download, CheckCircle, ShieldAlert } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";
import { Button, Card, DemoBanner, Field, FileDrop, PageHeader, useObjectUrl, inputCls, cx } from "../components/ui.jsx";
import { api } from "../services/api.js";

const IMG = ["image/png", "image/jpeg"];

export default function Watermark() {
  const toast = useToast();
  const [tab, setTab] = useState("embed");
  const [file, setFile] = useState(null);
  const [vfile, setVfile] = useState(null);
  const [marker, setMarker] = useState("DR-1024-REC-1001");
  const [method, setMethod] = useState("visible");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultImg, setResultImg] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const url = useObjectUrl(file);

  const runEmbed = async (e) => {
    e.preventDefault();
    if (!file) return setErr("Choose an image first.");
    if (!/^[A-Za-z0-9 _.-]{3,40}$/.test(marker)) {
      return setErr("Marker must be 3-40 characters: letters, numbers, space, dot, dash, underscore.");
    }
    setErr("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("marker", marker);
      fd.append("method", method);

      const res = await api.embedWatermark(fd);
      setResultImg(res.data_url);
      setMetrics(res.metrics);
      toast("success", `Watermark embedded successfully! PSNR: ${res.metrics.psnr_db} dB`);
    } catch (e) {
      setErr(e.message || "Failed to embed watermark.");
      toast("error", e.message || "Embedding error.");
    } finally {
      setBusy(false);
    }
  };

  const runVerify = async () => {
    if (!vfile) return;
    setVerifyBusy(true);
    setVerifyResult(null);

    try {
      const fd = new FormData();
      fd.append("file", vfile);
      fd.append("expected_marker", marker);

      const res = await api.verifyWatermark(fd);
      setVerifyResult(res);
      if (res.detected) {
        toast("success", `Watermark detected: ${res.marker || "Valid marker"}`);
      } else {
        toast("error", res.status || "No watermark detected.");
      }
    } catch (e) {
      toast("error", e.message || "Verification failed.");
    } finally {
      setVerifyBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Digital Watermarking" subtitle="Embed and verify a non-sensitive source marker in medical images using Python FastAPI." />
      <DemoBanner>
        Connected to FastAPI backend on <b>http://127.0.0.1:8000</b>. Digital watermarks are mathematically embedded with real-time Peak Signal-to-Noise Ratio (PSNR) calculation.
      </DemoBanner>
      <div className="mb-4 flex gap-2">
        {["embed", "verify"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx("rounded-lg px-4 py-2 text-sm font-medium capitalize transition",
              tab === t ? "bg-[#6F4E37] text-white shadow-sm" : "bg-white/90 text-[#462F20] border border-[#E5E4E2] hover:bg-[#E6E0F0]/50")}
          >
            {t === "embed" ? "Embed watermark" : "Verify watermark"}
          </button>
        ))}
      </div>

      {tab === "embed" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Settings" className="lg:col-span-1">
            <form onSubmit={runEmbed} className="space-y-4">
              <FileDrop accept={IMG} exts="PNG, JPG" maxMB={10} file={file} onFile={(f) => { setFile(f); setResultImg(null); setMetrics(null); }} label="Choose an image" />
              <Field label="Marker (doctor ID or record reference)" hint="e.g. DR-1024 or REC-1001.">
                <input className={inputCls} value={marker} onChange={(e) => setMarker(e.target.value)} />
              </Field>
              <Field label="Method">
                <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="visible">Visible text overlay</option>
                  <option value="invisible">Invisible (Frequency/LSB channel modulation)</option>
                </select>
              </Field>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <Button type="submit" loading={busy} className="w-full">
                <Stamp className="h-4 w-4" /> Embed Watermark
              </Button>
            </form>
          </Card>
          <Card title="Original vs Result" className="lg:col-span-2">
            {!url ? (
              <p className="py-16 text-center text-sm text-slate-400">Choose an image to see the side-by-side view.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <figure>
                  <img src={url} alt="Original" className="max-h-72 w-full rounded-lg bg-slate-100 object-contain" />
                  <figcaption className="mt-1 text-center text-xs text-slate-500">Original (unmodified)</figcaption>
                </figure>
                <figure>
                  <div className="relative">
                    <img src={resultImg || url} alt="Watermarked" className="max-h-72 w-full rounded-lg bg-slate-100 object-contain" />
                  </div>
                  <figcaption className="mt-1 text-center text-xs text-slate-500">
                    {resultImg ? "Watermarked image" : "Processed image appears here"}
                  </figcaption>
                </figure>
              </div>
            )}

            {metrics && (
              <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
                <h4 className="font-semibold text-teal-900">Clinical Image Quality Metrics</h4>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-teal-800">
                  <div><b>PSNR:</b> {metrics.psnr_db} dB</div>
                  <div><b>MSE:</b> {metrics.mse}</div>
                  <div><b>Quality:</b> {metrics.quality}</div>
                </div>
                {resultImg && (
                  <a href={resultImg} download={`watermarked_${marker}.png`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 underline">
                    <Download className="h-3.5 w-3.5" /> Download watermarked image
                  </a>
                )}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card title="Verify a watermark" className="max-w-2xl">
          <div className="space-y-4">
            <FileDrop accept={IMG} exts="PNG, JPG" maxMB={10} file={vfile} onFile={setVfile} label="Choose an image to check" />
            <Field label="Expected Marker (optional)" hint="Verifies if extracted marker matches reference.">
              <input className={inputCls} value={marker} onChange={(e) => setMarker(e.target.value)} />
            </Field>
            <Button disabled={!vfile} loading={verifyBusy} onClick={runVerify}>
              Verify watermark
            </Button>
            {verifyResult && (
              <div className={cx("rounded-lg p-4 text-sm border", verifyResult.detected ? "bg-teal-50 border-teal-200 text-teal-900" : "bg-red-50 border-red-200 text-red-900")}>
                <div className="flex items-center gap-2 font-semibold">
                  {verifyResult.detected ? <CheckCircle className="h-5 w-5 text-teal-600" /> : <ShieldAlert className="h-5 w-5 text-red-600" />}
                  {verifyResult.status}
                </div>
                {verifyResult.marker && (
                  <p className="mt-2 text-xs">
                    <b>Extracted marker:</b> <span className="font-mono">{verifyResult.marker}</span> (Confidence: {verifyResult.confidence_percent}%)
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
