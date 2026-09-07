import { useEffect, useMemo, useState } from "react";
import {
  calculateStats,
  createOrRefreshStatCard,
  disableStatCard,
  getActiveStatCard,
  getLibrary,
  loadWorks,
  saveLibrary
} from "../lib/data";
import StatCard from "../components/StatCard";
import { supabase } from "../lib/supabase";

export default function Settings({ user }) {
  const [name, setName] = useState("");
  const [stats, setStats] = useState(calculateStats([]));
  const [card, setCard] = useState(null);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  const shareUrl = useMemo(() => {
    if (!card?.share_token) return "";
    return `${window.location.origin}/s/${card.share_token}`;
  }, [card]);

  useEffect(() => {
    Promise.all([
      getLibrary(user?.id),
      loadWorks(user?.id),
      getActiveStatCard(user?.id)
    ]).then(([library, works, activeCard]) => {
      setName(library?.display_name || "My RaevynTide Library");
      setStats(calculateStats(works));
      setCard(activeCard);
    }).catch(e => setMessage(e.message));
  }, [user?.id]);

  const saveName = async (e) => {
    e.preventDefault();
    try {
      await saveLibrary(user?.id, name);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setMessage(e.message);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setMessage("");
    try {
      await saveLibrary(user?.id, name);
      const next = await createOrRefreshStatCard(user?.id, name, "midnight");
      setCard(next);
      setStats(next.statistics_snapshot);
      setMessage(card ? "Stat card refreshed." : "Stat card is live.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const disable = async () => {
    if (!card?.id) return;
    try {
      await disableStatCard(user?.id, card.id);
      setCard(null);
      setMessage("Public stat card disabled. Your private library is unchanged.");
    } catch (e) {
      setMessage(e.message);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      await navigator.share({
        title: `${name} · RaevynTide`,
        text: "My AO3 reading stats on RaevynTide",
        url: shareUrl
      });
    } else {
      await copyLink();
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Permanently delete your RaevynTide account, private library, and public stat card? This cannot be undone."
    );
    if (!confirmed) return;
    const typed = window.prompt('Type DELETE to confirm permanent account deletion.');
    if (typed !== "DELETE") return;

    setDeleting(true);
    setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session has expired. Sign in again.");
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not delete account.");
      await supabase.auth.signOut();
      window.location.assign("/");
    } catch (e) {
      setMessage(e.message);
      setDeleting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SETTINGS & SHARING</span>
          <h1>Your identity, your choice.</h1>
          <p>Your login identifies the account. This library name is the only identity shown on a stat card.</p>
        </div>
      </div>

      {message && <div className="notice">{message}</div>}

      <section className="panel">
        <span className="eyebrow">LIBRARY DISPLAY NAME</span>
        <h2>Name your shelf</h2>
        <p className="muted">Use a fandom handle, a shelf name, or anything else. It does not need to match your Google or AO3 identity.</p>
        <form onSubmit={saveName} className="inline-form">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Mary's Midnight Library" />
          <button className="primary">{saved ? "Saved ✓" : "Save name"}</button>
        </form>
      </section>

      <section className="panel share-panel" id="sharing">
        <div className="share-copy">
          <span className="eyebrow">PUBLIC STAT CARD</span>
          <h2>{card ? "Your card is live." : "Share the stats, not the shelf."}</h2>
          <p className="muted">
            Publishing creates a snapshot containing only the statistics shown below.
            Your saved work list, private ratings, account details, and reading history remain private. Any aggregate tags shown in the preview are part of the snapshot you are choosing to publish.
          </p>

          <div className="share-actions">
            <button className="primary" onClick={publish} disabled={publishing}>
              {publishing ? "Publishing…" : card ? "Refresh card" : "Publish stat card"}
            </button>
            {card && <button className="secondary" onClick={disable}>Disable public card</button>}
          </div>

          {card && (
            <div className="share-link-box">
              <span>Public link</span>
              <code>{shareUrl}</code>
              <div className="share-actions">
                <button className="secondary" onClick={copyLink}>{copied ? "Copied ✓" : "Copy link"}</button>
                <button className="secondary" onClick={nativeShare}>Share</button>
                <a className="secondary" href={shareUrl} target="_blank" rel="noreferrer">Open card</a>
              </div>
            </div>
          )}
        </div>

        <div className="card-preview">
          <StatCard displayName={name || "My RaevynTide"} stats={card?.statistics_snapshot || stats} />
        </div>
      </section>

      <section className="privacy-strip">
        <div><strong>Private shelf</strong><span>Your saved AO3 works stay behind your account.</span></div>
        <div><strong>Snapshot only</strong><span>The public endpoint returns only the stat-card JSON snapshot.</span></div>
        <div><strong>Revocable</strong><span>Disable the card and the public link stops returning it.</span></div>
      </section>

      <section className="panel danger-zone">
        <span className="eyebrow">ACCOUNT</span>
        <h2>Delete RaevynTide account</h2>
        <p className="muted">This permanently removes your account and the RaevynTide data attached to it, including your private shelf and stat cards.</p>
        <button className="danger-button" onClick={deleteAccount} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </section>
    </main>
  );
}
