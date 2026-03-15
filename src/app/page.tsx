import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PlusCircle } from "lucide-react";

export default async function Home() {
  const { data: competitions } = await supabase
    .from("competitions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your raffle competitions</p>
        </div>
        <Link
          href="/competitions/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <PlusCircle size={16} />
          New Competition
        </Link>
      </div>

      {!competitions || competitions.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium">No competitions yet</p>
          <p className="text-sm mt-1">Create your first competition to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {competitions.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-gray-900">{comp.title}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      comp.status === "live"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{comp.short_description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>£{comp.ticket_price} per ticket</span>
                  <span>{comp.total_tickets} tickets</span>
                  <span>{comp.start_date} → {comp.end_date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/competitions/${comp.id}/edit`}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
