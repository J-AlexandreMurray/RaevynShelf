import { kofiUrl } from "../lib/config";

export default function About() {
  return <main className="page legal">
    <span className="eyebrow">ABOUT</span>
    <h1>Made for AO3 readers.</h1>
    <p>RaevynShelf is an independent, AO3-only reading companion for keeping a private shelf, seeing your reading statistics, and sharing a deliberately limited stat card when you want to.</p>
    <p>RaevynShelf is not affiliated with, endorsed by, or operated by the Organization for Transformative Works or Archive of Our Own.</p>
    <h2>Support development</h2>
    <p>RaevynShelf is intended to remain free to use. If you enjoy it, you can optionally support its independent development through Ko-fi.</p>
    {kofiUrl ? <a className="primary" href={kofiUrl} target="_blank" rel="noreferrer">☕ Support development</a> : <p className="muted">Support link will appear here once the Ko-fi creator URL is configured.</p>}
  </main>;
}
