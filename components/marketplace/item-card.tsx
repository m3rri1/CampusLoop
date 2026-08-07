import { Item } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow">
      <div className="relative w-full h-40">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {item.sellerName} · ⭐ {item.sellerRating}
        </p>
        <Badge variant="secondary" className="mt-2 text-xs capitalize">
          {item.condition}
        </Badge>
      </CardContent>
      <CardFooter className="px-3 pb-3 pt-0">
        <p className="font-bold text-[#6759FF]">₹{item.price}</p>
      </CardFooter>
    </Card>
  );
}