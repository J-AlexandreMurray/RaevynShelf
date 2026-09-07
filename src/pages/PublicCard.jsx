import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatCard from "../components/StatCard";

export default function PublicCard({ token }) {
  const [card, setCard] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError("Sharing is not configured.");
      return;
    }

    supabase.rpc("get_public_stat_card", { p_token: token })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setCard(data || null);
      });
  }, [token]);

  if (error || card === null) {
    return (
      <main className="public-page">
        <div className="public-message">
          <span className="eyebrow">RAEVYNSHELF</span>
          <h1>That stat card isn't available.</h1>
          <p>It may have been disabled, refreshed with a new link, or the URL may be incorrect.</p>
        </div>
      </main>
    );
  }

  if (card === undefined) {
    return <main className="public-page"><div className="public-message">Loading RaevynShelf…</div></main>;
  }

  return (
    <main className="public-page">
      <div>
        <StatCard
          displayName={card.display_name}
          stats={card.statistics_snapshot}
          theme={card.theme}
        />
        <p className="public-brand">RaevynShelf · private AO3 reading companion</p>
      </div>
    </main>
  );
}
