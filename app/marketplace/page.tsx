import { ItemCard } from "@/components/marketplace/item-card";
import { mockItems } from "@/lib/mock-data";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Marketplace</h1>

      <div className="grid grid-cols-2 gap-3">
        {mockItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}