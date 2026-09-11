import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { watermarkImage } from "@/lib/watermark";

/**
 * Listing-photo upload endpoint. Watermarks every incoming photo (see
 * lib/watermark.ts) before it's saved — the actual "process on upload"
 * pipeline the rest of the app doesn't have a UI for yet.
 *
 * Storage is the local `public/images/vehicles/uploads/` folder for now,
 * mirroring how the rest of the demo inventory is served. Swap the write
 * step below for real object storage (Vercel Blob, S3, Supabase Storage…)
 * once one is wired up — see PRODUCT.md's "Capabilities and Constraints".
 *
 * sharp is a native module, so this route must run on the Node runtime,
 * never Edge.
 */
export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public/images/vehicles/uploads");
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo 'photo' en el form-data." },
      { status: 400 },
    );
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usá JPEG, PNG o WEBP." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el tamaño máximo de 10 MB." },
      { status: 413 },
    );
  }

  const original = Buffer.from(await file.arrayBuffer());
  const watermarked = await watermarkImage(original);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const filename = `${Date.now()}-${safeName}`;
  await writeFile(path.join(UPLOAD_DIR, filename), watermarked);

  return NextResponse.json({
    url: `/images/vehicles/uploads/${filename}`,
  });
}
