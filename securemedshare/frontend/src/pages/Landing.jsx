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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8FD] via-[#E6E0F0]/40 to-[#E5E4E2]">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[#E5E4E2] bg-white/75 backdrop-blur-md px-6 py-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-[#332216]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E6E0F0] to-[#E5E4E2] text-[#6F4E37] shadow-xs">
            <ShieldPlus className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">SecureMedShare</span>
        </div>
        <div className="flex gap-2.5">
          <Link to="/login"><Button variant="outline">Log in</Button></Link>
          <Link to="/register"><Button>Get started</Button></Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D6CCEA] bg-[#E6E0F0]/80 text-xs font-semibold uppercase tracking-wider text-[#6F4E37] mb-6 shadow-2xs">
            <span>Doctor-Patient Watermarking & Steganography</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-[#2E1D12] sm:text-5xl">
            Secure Medical Data. Trusted Healthcare.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#5A3E2B]/85">
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
        <h2 className="mb-10 text-center text-2xl font-bold text-[#332216]">Core Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-[#E5E4E2] bg-white/90 p-6 shadow-sm backdrop-blur-xs hover:border-[#6F4E37]/50 hover:shadow-md transition">
              <div className="mb-4 inline-block rounded-lg bg-[#E6E0F0] p-3 text-[#6F4E37] ring-1 ring-[#D6CCEA]"><Icon className="h-6 w-6" /></div>
              <h3 className="font-semibold text-[#332216]">{title}</h3>
              <p className="mt-1.5 text-sm text-[#5A3E2B]/80">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#E5E4E2] bg-[#E5E4E2]/60 py-6 text-center text-xs text-[#6F4E37]">
        Academic demonstration. Uses synthetic data only - do not upload real patient information.
      </footer>
    </div>
  );
}
