import { useState } from "react";
import { BookingsManager } from "./BookingsManager";
import { ServicesManager } from "./ServicesManager";
import { SettingsManager } from "./SettingsManager";

type DashboardView = "bookings" | "services" | "settings";

export function OwnerDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<DashboardView>("bookings");

  async function logout() {
    await fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    } );

    onLogout();
  }

  return (
    <main className="page-shell">
      <nav className="dashboard-nav" aria-label="Owner dashboard">
        <div>
          <p className="eyebrow">BookEase owner</p>
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-actions">
          <button type="button" onClick={() => setView("bookings")}>
            Bookings
          </button>
          <button type="button" onClick={() => setView("services")}>
            Services
          </button>
          <button type="button" onClick={() => setView("settings")}>
            Settings
          </button>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </nav>

      {view === "bookings" && <BookingsManager />}
      {view === "services" && <ServicesManager />}
      {view === "settings" && <SettingsManager />}
    </main>
  );
}