"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  ticket_price: z.coerce.number().positive("Must be greater than 0"),
  total_tickets: z.coerce.number().int().positive("Must be greater than 0"),
});

type FormData = z.infer<typeof schema>;

export default function EditCompetition({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setTitle(data.title);
        reset({
          start_date: data.start_date,
          end_date: data.end_date,
          ticket_price: data.ticket_price,
          total_tickets: data.total_tickets,
        });
      }
    }
    load();
  }, [params.id, reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("competitions")
        .update(data)
        .eq("id", params.id);
      if (updateError) throw updateError;
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this competition?")) return;
    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from("competitions")
        .delete()
        .eq("id", params.id);
      if (deleteError) throw deleteError;
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Competition</h1>
          <p className="text-gray-500 text-sm mt-1">{title}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Competition"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 rounded-xl p-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" {...register("start_date")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" {...register("end_date")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (£)</label>
            <input type="number" step="0.01" {...register("ticket_price")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            {errors.ticket_price && <p className="text-red-500 text-xs mt-1">{errors.ticket_price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Tickets</label>
            <input type="number" {...register("total_tickets")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
            {errors.total_tickets && <p className="text-red-500 text-xs mt-1">{errors.total_tickets.message}</p>}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
