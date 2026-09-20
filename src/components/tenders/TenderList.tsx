import type { Tender } from "@/lib/procurement/types";
import { TenderCard } from "./TenderCard";

export function TenderList({ tenders }: { tenders: Tender[] }) {
  return (
    <ul className="grid gap-4">
      {tenders.map((tender) => (
        <li key={tender.id}>
          <TenderCard tender={tender} />
        </li>
      ))}
    </ul>
  );
}
