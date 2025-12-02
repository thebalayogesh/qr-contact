// app/page.tsx (client)
"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import QRCodePreview from "@/components/QRCodePreview";

export default function Home() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", phone: "", description: "" });
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return setFileDataUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setFileDataUrl(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      alert("Please sign in first");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      links: [],
      logoDataUrl: fileDataUrl,
    };
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setQr({ dataUrl: data.qrDataUrl, publicUrl: data.publicUrl, slug: data.contact.slug });
    else alert(data.error || "Create failed");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          {/* place AuthButtons in your header/layout */}
        </div>

        <form onSubmit={create} className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Contact Card</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded mb-3" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-2 border rounded mb-3" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded mb-3" />
          <label className="block mb-2">Logo (optional)</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          <div className="mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
              {loading ? "Creating..." : "Create & Generate QR"}
            </button>
          </div>
        </form>

        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          {qr ? (
            <>
              <QRCodePreview dataUrl={qr.dataUrl} shortUrl={qr.publicUrl} />
              <div className="mt-4">
                <a href={qr.publicUrl} target="_blank" rel="noreferrer" className="text-sm break-all">{qr.publicUrl}</a>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Generated QR will show here after create.</div>
          )}
        </div>
      </div>
    </div>
  );
}
