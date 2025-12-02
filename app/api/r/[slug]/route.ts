// app/api/r/[slug]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { contacts, scans } from "@/db/schema";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const found = await db.select().from(contacts).where(contacts.slug.eq(slug)).limit(1);
    if (!found.length) return new Response("Not found", { status: 404 });

    const contact = found[0];
    const ua = req.headers.get("user-agent") ?? null;
    const ref = req.headers.get("referer") ?? null;
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? null);

    await db.insert(scans).values({
      contactId: contact.id,
      userAgent: ua,
      ip,
      referrer: ref,
    });

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/c/${slug}`;
    return NextResponse.redirect(redirectUrl);
  } catch (e) {
    console.error("GET /r/: error", e);
    return new Response("server error", { status: 500 });
  }
}
