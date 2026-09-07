import { kofiUrl } from "../lib/config";
import { NavLink } from "react-router-dom";

export default function Layout({ children, onSignOut }) {
  return <div className="site">
    <header className="topbar">
      <NavLink className="brand" to="/">✦ RaevynShelf</NavLink>
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        {kofiUrl && <a href={kofiUrl} target="_blank" rel="noreferrer">Support</a>}
        <button className="text-button" onClick={onSignOut}>Sign out</button>
      </nav>
    </header>
    {children}
    <footer className="footer">
      <span>RaevynShelf is an independent AO3 companion.</span>
      <span><NavLink to="/about">About</NavLink> · <NavLink to="/privacy">Privacy</NavLink></span>
    </footer>
  </div>;
}
