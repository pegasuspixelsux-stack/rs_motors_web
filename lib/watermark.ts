import sharp from "sharp";
import path from "node:path";

/**
 * Applies the RS Motors mark as a faint, centered watermark to a listing
 * photo buffer. Runs server-side (Node runtime — sharp is a native module,
 * not available on Edge) as part of the upload pipeline, before the file is
 * written to storage.
 */

const WATERMARK_PATH = path.join(
  process.cwd(),
  "public/images/rs-logo-transparent.png",
);

/** Watermark width as a fraction of the photo's width. */
const WATERMARK_WIDTH_RATIO = 0.5;
/** Alpha multiplier — kept low so the mark is present but barely visible. */
const WATERMARK_OPACITY = 0.12;

export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const source = sharp(input).rotate(); // normalize EXIF orientation first
  const { width, height } = await source.metadata();
  if (!width || !height) return input;

  const markWidth = Math.max(1, Math.round(width * WATERMARK_WIDTH_RATIO));

  const { data, info } = await sharp(WATERMARK_PATH)
    .resize({ width: markWidth })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Scale down the mark's own alpha channel to make it faint, rather than
  // relying on sharp's composite blending (which has no direct "opacity" knob).
  const faded = Buffer.from(data);
  for (let i = 3; i < faded.length; i += 4) {
    faded[i] = Math.round(faded[i] * WATERMARK_OPACITY);
  }

  const watermarkPng = await sharp(faded, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return source
    .composite([{ input: watermarkPng, gravity: "center" }])
    .toBuffer();
}
