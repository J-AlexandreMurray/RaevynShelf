import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import PublicCard from "./pages/PublicCard";

function PublicRoute() {
  const { token } = useParams();
  return <PublicCard token={token} />;
}

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <main className="loading">Loading RaevynTide…</main>;

  return <Routes>
    <Route path="/s/:token" element={<PublicRoute />} />
    <Route path="/privacy" element={session ? <Layout onSignOut={() => supabase.auth.signOut()}><Privacy /></Layout> : <Privacy />} />
    <Route path="/about" element={session ? <Layout onSignOut={() => supabase.auth.signOut()}><About /></Layout> : <About />} />
    {session ? (
      <Route path="*" element={
        <Layout onSignOut={() => supabase.auth.signOut()}>
          <Routes>
            <Route path="/" element={<Dashboard user={session.user} />} />
            <Route path="/library" element={<Library user={session.user} />} />
            <Route path="/settings" element={<Settings user={session.user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    ) : <Route path="*" element={<Login />} />}
  </Routes>;
}
