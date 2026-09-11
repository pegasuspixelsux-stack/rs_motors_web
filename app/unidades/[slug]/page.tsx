import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site-nav";
import { Footer } from "@/components/site-footer";
import { VehicleDetail } from "@/components/vehicle-detail";
import { getInventory } from "@/lib/inventory";
import { fmtInt, fmtUSD } from "@/lib/format";

type Params = { slug: string };

function findVehicle(slug: string) {
  return getInventory().find((v) => v.slug === slug);
}

export async function generateStaticParams() {
  return getInventory().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = findVehicle(slug);
  if (!vehicle) return { title: "Unidad no encontrada — RS Motors" };

  const title = `${vehicle.marca} ${vehicle.modelo} ${vehicle.anio} — RS Motors`;
  return {
    title,
    description: `${vehicle.marca} ${vehicle.modelo} ${vehicle.version} · ${vehicle.anio} · ${fmtInt(vehicle.km)} km · ${fmtUSD(vehicle.precioUSD)}. Consultá disponibilidad por WhatsApp.`,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const vehicle = findVehicle(slug);
  if (!vehicle) notFound();

  return (
    <div>
      <Nav />
      <main>
        <VehicleDetail vehicle={vehicle} />
      </main>
      <Footer />
    </div>
  );
}
