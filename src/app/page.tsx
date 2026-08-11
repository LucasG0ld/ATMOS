import { AtmosphereCatalogue } from "@/components/home/atmosphere-catalogue";
import { atmospheres } from "@/data/atmospheres";

export default function HomePage() {
  return <AtmosphereCatalogue atmospheres={atmospheres} />;
}
