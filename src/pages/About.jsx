import { kofiUrl } from "../lib/config";

export default function About() {
  return <main className="page legal">
    <span className="eyebrow">ABOUT</span>
    <h1>Made for AO3 readers.</h1>
    <p>RaevynTide Library is an independent, AO3-only reading companion for readers that wish to keep up with their own private shelf, see their everchanging reading statistics, and even optionally share a 'reading stat' card to others.</p>
    <p><strong>RaevynTide Library is not affiliated with, endorsed by, or operated by the Organization for Transformative Works or Archive of Our Own. The RaevynTide Project is purely an indipendent project created and supported by a fan of the community.</strong></p>

    <h2>Support development</h2>

<p>
  The RaevynTide Library app is intended to remain free to use indefinitely.
  If you enjoy it, you can optionally support its independent development
  through Ko-fi.
</p>

{kofiUrl && (
  <a
    className="primary"
    href={kofiUrl}
    target="_blank"
    rel="noopener noreferrer"
  >
    ☕ Support development
  </a>
)}
</main>
}