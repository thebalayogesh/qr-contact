// app/api/contacts/route.ts
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/db/drizzle";
import { contacts } from "@/db/schema";
import { generateQrDataUrl } from "../../../lib/qrcode-server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const ownerId = session.user.id as string;

  try {
    const body = await req.json();
    const { name, phone, description, links, logoDataUrl } = body;
    if (!name) return new Response(JSON.stringify({ error: "name required" }), { status: 400 });

    const slug = nanoid(8);
    const linksJson = Array.isArray(links) ? links : [];

    const inserted = await db
      .insert(contacts)
      .values({
        slug,
        name,
        phone: phone || null,
        description: description || null,
        links: linksJson,
        ownerId,
      })
      .returning();

    const contact = inserted[0];

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const publicUrl = `${base}/r/${slug}`;
    const qrDataUrl = await generateQrDataUrl(publicUrl, { logoDataUrl: logoDataUrl || null });

    return new Response(JSON.stringify({ contact, qrDataUrl, publicUrl }), { status: 201 });
  } catch (err) {
    console.error("POST /api/contacts error", err);
    return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
  }
}
