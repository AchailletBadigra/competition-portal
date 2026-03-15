"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

type Entry = {
  id: string;
  name: string;
  email: string;
  ticket_number: number;
  purchased_at: string;
  competition_id: string;
  competitions: { title: string };
};

type Competition = {
  id: string;
  title: string;
};

export default function Entries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: comps } = await supabase.from("competitions").select("id, title");
      setCompetitions(comps ?? []);

      const { data } = await supabase
        .from("entries")
        .select("*, competitions(title)")
        .order("purchased_at", { ascending: false });
      setEntries((data as Entry[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = selectedComp === "all"
    ? entries
    : entries.filter((e) => e.competition_id === selectedComp);

  function exportToExcel() {
    const rows = filtered.map((e) => ({
      Name: e.name,
      Email: e.email,
      "Ticket Number": e.ticket_number,
      Competition: e.competitions?.title,
      "Purchased At": new Date(e.purchased_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entries");
    XLSX.writeFile(wb, "entries.xlsx");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entries</h1>
          <p className="text-gray-500 text-sm mt-1">View and export competition entries</p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Export to Excel
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedComp}
          onChange={(e) => setSelectedComp(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Competitions</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-center py-16 text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No entries found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Ticket #</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Competition</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Purchased</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{entry.name}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.email}</td>
                  <td className="px-6 py-4 text-gray-600">#{entry.ticket_number}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.competitions?.title}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(entry.purchased_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
