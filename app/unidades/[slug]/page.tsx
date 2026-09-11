import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site-nav";
import { Footer } from "@/components/site-footer";
import { VehicleDetail } from "@/components/vehicle-detail";
import { getPublicVehicles } from "@/lib/vehicles-public";
import { fmtInt, fmtUSD } from "@/lib/format";

// Real inventory changes via the admin panel at any time, so this page is
// re-fetched from Firestore rather than frozen at build time.
export const revalidate = 60;

type Params = { slug: string };

async function findVehicle(slug: string) {
  const vehicles = await getPublicVehicles();
  return vehicles.find((v) => v.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await findVehicle(slug);
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
  const vehicle = await findVehicle(slug);
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
