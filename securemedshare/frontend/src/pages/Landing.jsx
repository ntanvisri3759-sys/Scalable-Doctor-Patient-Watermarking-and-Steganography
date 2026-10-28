import { Link } from "react-router-dom";
import { ShieldPlus, Stamp, EyeOff, Lock, Hash, Share2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui.jsx";

const FEATURES = [
  { icon: Stamp, title: "Digital Watermarking", text: "Embed a non-sensitive marker into medical images to help trace the source and detect certain modifications." },
  { icon: EyeOff, title: "LSB Steganography", text: "Hide selected information inside supported lossless images (such as PNG)." },
  { icon: Lock, title: "Encryption", text: "Protect confidential payloads with AES-256-GCM. Steganography hides presence, encryption protects content." },
  { icon: Hash, title: "Integrity Verification", text: "Compare a SHA-256 hash against a trusted server-side reference to see if a file changed." },
  { icon: Share2, title: "Secure Sharing", text: "Role-based access lets doctors share records only with authorized patients, with revocable permissions." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-navy-900">
          <ShieldPlus className="h-7 w-7 text-teal-600" />
          <span className="text-lg font-bold">SecureMedShare</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="outline">Log in</Button></Link>
          <Link to="/register"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="bg-gradient-to-b from-navy-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-teal-700">Final-year project - BTech CSE</p>
          <h1 className="text-4xl font-extrabold leading-tight text-navy-900 sm:text-5xl">Secure Medical Data. Trusted Healthcare.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            A platform where doctors can upload medical reports, prescriptions and images, protect them with watermarking,
            steganography, encryption and integrity checks, and share them only with authorized patients.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg">Create account <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="navy">Try the demo</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-navy-900">Core features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-3 inline-block rounded-lg bg-teal-50 p-3 text-teal-700"><Icon className="h-6 w-6" /></div>
              <h3 className="font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Academic demonstration. Uses synthetic data only - do not upload real patient information.
      </footer>
    </div>
  );
}
