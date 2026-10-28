import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, PageHeader, cx } from "../components/ui.jsx";

const FAQ = [
  ["What does digital watermarking do?", "It embeds a non-sensitive marker (for example a doctor ID or record reference) into an image. It can help indicate the source and reveal some modifications, but it can be damaged or removed by editing or re-compression."],
  ["What is LSB steganography?", "It hides data in the least significant bits of pixel values in lossless images such as PNG. It hides that a message exists; it does not encrypt it, so confidential payloads are encrypted first."],
  ["Why is JPEG not supported for steganography?", "JPEG is lossy. Re-compression changes pixel values and destroys LSB-embedded data."],
  ["What does SHA-256 verification prove?", "It shows whether a file's contents match a trusted reference hash. It does not independently prove who created the file."],
  ["Who can see my records?", "Only you and doctors you have been granted access with. Administrators manage accounts but should not see medical file contents. This is enforced by the server from Phase 2."],
  ["Is this safe for real patient data?", "No. This is an academic project. Use synthetic data and sample images only."],
];

export default function Help() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHeader title="Help" subtitle="Concepts, limitations and frequently asked questions." />
      <Card className="max-w-3xl">
        {FAQ.map(([q, a], i) => (
          <div key={q} className="border-b border-slate-100 last:border-0">
            <button className="flex w-full items-center justify-between py-3 text-left font-medium text-navy-900" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {q}<ChevronDown className={cx("h-4 w-4 transition", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="pb-4 text-sm text-slate-600">{a}</p>}
          </div>
        ))}
      </Card>
    </>
  );
}
