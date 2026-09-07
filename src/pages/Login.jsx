import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { kofiUrl } from "../lib/config";

export default function Login() {
  const login = async () => {
    if (!supabase) return alert("Configure Supabase first.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin }
    });
    if (error) alert(error.message);
  };

  return <main className="landing">
    <nav className="landing-nav">
      <strong>✦ RaevynShelf</strong>
      <div><Link to="/about">About</Link><Link to="/privacy">Privacy</Link></div>
    </nav>
    <section className="landing-hero">
      <div>
        <span className="eyebrow">AO3 • PRIVATE • YOURS</span>
        <h1>Your AO3 reading, beautifully yours.</h1>
        <p>Keep a private shelf, explore your reading statistics, and share a stat card without publishing your reading history.</p>
        <button className="primary hero-button" onClick={login}>Continue with Google</button>
        <small>Your login identity is separate from the name you choose for your shelf.</small>
      </div>
      <div className="landing-card-demo">
        <span>✦ RAEVYNSHELF</span>
        <h2>Midnight Shelf</h2>
        <div><strong>247</strong><small>works</small></div>
        <div><strong>1.8M</strong><small>words</small></div>
        <p>Share the stats. Keep the shelf private.</p>
      </div>
    </section>
    <section className="landing-features">
      <div><strong>Private by default</strong><p>Your saved works live behind your account.</p></div>
      <div><strong>AO3-focused</strong><p>Import public AO3 work metadata instead of pretending this is another generic book tracker.</p></div>
      <div><strong>Share on purpose</strong><p>Only a deliberately published aggregate stat snapshot becomes public.</p></div>
    </section>
    <footer className="landing-footer"><Link to="/about">About</Link><Link to="/privacy">Privacy</Link>{kofiUrl && <a href={kofiUrl} target="_blank" rel="noreferrer">☕ Support development</a>}</footer>
  </main>;
}
