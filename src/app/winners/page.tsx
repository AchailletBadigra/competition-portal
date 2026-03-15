"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: string;
  name: string;
  email: string;
  ticket_number: number;
  competitions: { id: string; title: string };
};

export default function Winners() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [announcing, setAnnouncing] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!ticketNumber) return;
    setSearching(true);
    setNotFound(false);
    setEntry(null);
    setAnnounced(false);
    setError(null);

    const { data } = await supabase
      .from("entries")
      .select("*, competitions(id, title)")
      .eq("ticket_number", parseInt(ticketNumber))
      .single();

    if (data) {
      setEntry(data as Entry);
    } else {
      setNotFound(true);
    }
    setSearching(false);
  }

  async function handleAnnounce() {
    if (!entry) return;
    setAnnouncing(true);
    setError(null);

    try {
      const res = await fetch("/api/announce-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: entry.competitions.id,
          competitionTitle: entry.competitions.title,
          winnerName: entry.name,
          winnerTicket: entry.ticket_number,
        }),
      });

      if (!res.ok) throw new Error("Failed to send announcement");
      setAnnounced(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnnouncing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Winners</h1>
        <p className="text-gray-500 text-sm mt-1">Look up a winner by ticket number and announce the result</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Winning Ticket Number</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g. 42"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">No entry found for ticket #{ticketNumber}</p>
          </div>
        )}

        {entry && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Winner Found</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{entry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{entry.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ticket Number</p>
                  <p className="font-semibold text-gray-900">#{entry.ticket_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Competition</p>
                  <p className="font-semibold text-gray-900">{entry.competitions?.title}</p>
                </div>
              </div>
            </div>

            {announced ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-600 text-sm font-medium">Announcement emails sent successfully!</p>
              </div>
            ) : (
              <button
                onClick={handleAnnounce}
                disabled={announcing}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {announcing ? "Sending emails..." : "Announce Winner to All Entrants"}
              </button>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
