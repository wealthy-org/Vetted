"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [kols, setKols] = useState(null);
  const [username, setUsername] = useState("");

  function load() {
    fetch("/api/kols")
      .then((res) => res.json())
      .then((data) => setKols(data.items ?? []));
  }

  useEffect(load, []);

  async function addKol(e) {
    e.preventDefault();
    if (!username.trim()) return;
    await fetch("/api/kols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xUsername: username.trim() }),
    });
    setUsername("");
    load();
  }

  async function removeKol(id) {
    await fetch("/api/kols", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>Settings</h1>
        <p>Manage which KOL accounts Vetted tracks for you.</p>
      </div>

      <form className="settings-form" onSubmit={addKol}>
        <input
          type="text"
          placeholder="@username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit" className="btn btn--primary">
          Add KOL
        </button>
      </form>

      {kols === null ? (
        <div className="dp__empty">
          <p>Loading…</p>
        </div>
      ) : kols.length === 0 ? (
        <div className="dp__empty">
          <p>No KOLs tracked yet.</p>
          <span>Add an X username above to start tracking their calls.</span>
        </div>
      ) : (
        <div className="dp__table">
          <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1fr 1fr 0.6fr" }}>
            <span>Username</span>
            <span>Added</span>
            <span></span>
          </div>
          {kols.map((k) => (
            <div className="dp__row" key={k.id} style={{ gridTemplateColumns: "1fr 1fr 0.6fr" }}>
              <span>
                <b>@{k.x_username}</b>
              </span>
              <span className="dp__muted">{new Date(k.added_at).toLocaleDateString()}</span>
              <span>
                <button className="dp__add" onClick={() => removeKol(k.id)}>
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
