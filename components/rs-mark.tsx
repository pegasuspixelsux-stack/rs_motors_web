import Image from "next/image";
import redMark from "@/public/images/rs_logo.png";
import whiteMark from "@/public/images/rs_logo_white.png";

type Props = {
  /** rendered height in px; width follows the mark's aspect ratio */
  height?: number;
  tone?: "red" | "white";
  className?: string;
  priority?: boolean;
};

const RATIO = 2172 / 724;

export function RSMark({
  height = 24,
  tone = "red",
  className,
  priority,
}: Props) {
  return (
    <Image
      src={tone === "white" ? whiteMark : redMark}
      alt="RS Motors"
      height={height}
      width={Math.round(height * RATIO)}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
