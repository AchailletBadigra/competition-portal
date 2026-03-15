"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  short_description: z.string().min(1, "Short description is required"),
  full_description: z.string().min(1, "Full description is required"),
  ticket_price: z.coerce.number().positive("Must be greater than 0"),
  total_tickets: z.coerce.number().int().positive("Must be greater than 0"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type FormData = z.infer<typeof schema>;

export default function NewCompetition() {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "live" | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from("competition-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("competition-images")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function onSubmit(data: FormData, status: "draft" | "live") {
    setLoading(status);
    setError(null);
    try {
      let coverUrl = null;
      if (coverImage) {
        coverUrl = await uploadImage(coverImage, `covers/${Date.now()}-${coverImage.name}`);
      }

      const galleryUrls: string[] = [];
      for (const file of galleryImages) {
        const url = await uploadImage(file, `gallery/${Date.now()}-${file.name}`);
        galleryUrls.push(url);
      }

      const { error: insertError } = await supabase.from("competitions").insert({
        ...data,
        cover_image: coverUrl,
        gallery_images: galleryUrls,
        status,
      });

      if (insertError) throw insertError;
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">New Competition</h1>

      <form className="space-y-6 bg-white border border-gray-200 rounded-xl p-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Competition Title</label>
          <input {...register("title")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input {...register("short_description")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          {errors.short_description && <p className="text-red-500 text-xs mt-1">{errors.short_description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
          <textarea {...register("full_description")} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          {errors.full_description && <p className="text-red-500 text-xs mt-1">{errors.full_description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files ?? []))} className="w-full text-sm text-gray-500" />
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            disabled={!!loading}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading === "draft" ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "live"))}
            disabled={!!loading}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading === "live" ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </form>
    </div>
  );
}
