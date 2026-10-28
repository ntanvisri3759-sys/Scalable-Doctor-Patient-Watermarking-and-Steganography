import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import { Login, Register } from "./pages/AuthPages.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Records from "./pages/Records.jsx";
import Watermark from "./pages/Watermark.jsx";
import Stego from "./pages/Stego.jsx";
import Verify from "./pages/Verify.jsx";
import Sharing from "./pages/Sharing.jsx";
import Notifications from "./pages/Notifications.jsx";
import Audit from "./pages/Audit.jsx";
import Settings from "./pages/Settings.jsx";
import Help from "./pages/Help.jsx";

// NOTE: frontend guards are UX only. Real authorization is enforced by the server in Phase 2.
function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user.role) ? children : <Navigate to="/app" replace />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold text-navy-900">404</h1>
      <p className="text-slate-500">That page does not exist.</p>
      <Link to="/" className="text-teal-600 underline">Back to home</Link>
    </div>
  );
}

export default function App() {
  const r = (roles, el) => <RequireRole roles={roles}>{el}</RequireRole>;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={r(["doctor"], <Upload />)} />
        <Route path="records" element={r(["doctor", "patient"], <Records />)} />
        <Route path="watermark" element={r(["doctor"], <Watermark />)} />
        <Route path="stego" element={r(["doctor"], <Stego />)} />
        <Route path="verify" element={r(["doctor", "patient"], <Verify />)} />
        <Route path="sharing" element={r(["doctor", "patient"], <Sharing />)} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit" element={r(["doctor", "admin"], <Audit />)} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
