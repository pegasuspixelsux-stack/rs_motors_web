import { NextRequest, NextResponse } from "next/server";
import { watermarkImage } from "@/lib/watermark";

/**
 * Listing-photo watermarking endpoint. Applies the RS Motors mark (see
 * lib/watermark.ts) to an incoming photo and hands the watermarked bytes
 * straight back — it doesn't persist anything itself. The caller (the
 * admin's AddInventoryModal) uploads those bytes to Firebase Storage via
 * the client SDK, since Storage only needs the public web config, not a
 * service-account credential this route would otherwise require.
 *
 * sharp is a native module, so this route must run on the Node runtime,
 * never Edge.
 */
export const runtime = "nodejs";

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

  return new NextResponse(new Uint8Array(watermarked), {
    status: 200,
    headers: { "Content-Type": file.type },
  });
}
