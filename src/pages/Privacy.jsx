export default function Privacy() {
  return <main className="legal page">
    <span className="eyebrow">PRIVACY</span>
    <h1>Private by design.</h1>
    <p>RaevynTide stores the reading data you choose to add so your private dashboard can work across devices. Your saved works are not published as a profile or searchable library.</p>
    <h2>What is stored</h2>
    <p>When you sign in, the authentication provider supplies the account information required to identify your RaevynTide account. The RaevynTide Library also stores the AO3 work metadata, statuses, ratings, and settings you choose to save.</p>
    <h2>Stat cards</h2>
    <p>A stat card is public only after you deliberately publish it. The public card contains a snapshot of the displayed aggregate statistics and your chosen library display name. It does not expose your saved work list or login identity. You can disable the public card from Settings.</p>
    <h2>AO3 requests</h2>
    <p>When you import a public AO3 work URL, RaevynTide requests that public work page from AO3 to read metadata needed for your shelf. RaevynTide does not ask for your AO3 password.</p>
    <h2>Analytics</h2>
    <p>Before public launch, production analytics must be configured to avoid sending reading titles, AO3 URLs, stat-card tokens, email addresses, or other user-specific library data to analytics services.</p>
    <h2>Deleting your account</h2>
    <p>You can permanently delete your RaevynTide account from Settings. The application database rows owned by that account are configured to cascade-delete with the authentication account.</p>
    <p className="muted">This page is product privacy copy, not a substitute for jurisdiction-specific legal review before a public launch.</p>
  </main>;
}
