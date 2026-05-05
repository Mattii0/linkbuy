import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    description: string | null;
    image: string;
    affiliateLink: string;
    price: string | null;
    originalPrice: string | null;
    discount: number | null;
    store: string;
    featured: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    categoryId: number | null;
  };
  category?: { id: number; name: string; slug: string } | null;
  isFavorited?: boolean;
  isInCart?: boolean;
  onFavoriteToggle?: () => void;
  onCartToggle?: () => void;
};

const storeClass: Record<string, string> = {
  Shopee: "store-shopee",
  Amazon: "store-amazon",
  AliExpress: "store-aliexpress",
  "Mercado Livre": "store-mercadolivre",
  Shein: "store-shein",
};

export default function ProductCard({
  product,
  category,
  isFavorited = false,
  isInCart = false,
  onFavoriteToggle,
  onCartToggle,
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const addFav = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Adicionado aos favoritos!");
    },
  });
  const removeFav = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Removido dos favoritos.");
    },
  });
  const addCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Adicionado ao carrinho!");
    },
  });
  const removeCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Removido do carrinho.");
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Faça login para favoritar produtos.", {
        action: { label: "Entrar", onClick: () => (window.location.href = getLoginUrl()) },
      });
      return;
    }
    if (isFavorited) {
      removeFav.mutate({ productId: product.id });
    } else {
      addFav.mutate({ productId: product.id });
    }
    onFavoriteToggle?.();
  };

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Faça login para usar o carrinho.", {
        action: { label: "Entrar", onClick: () => (window.location.href = getLoginUrl()) },
      });
      return;
    }
    if (isInCart) {
      removeCart.mutate({ productId: product.id });
    } else {
      addCart.mutate({ productId: product.id });
    }
    onCartToggle?.();
  };

  const price = product.price ? parseFloat(product.price) : null;
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = product.discount ?? 0;

  return (
    <Card className="product-card group overflow-hidden border-0 shadow-md bg-card h-full flex flex-col">
      {/* Image */}
      <Link href={`/produto/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
            }}
          />
        </div>
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          </div>
        )}
        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 right-2">
            <span className="linkbuy-gradient text-white text-xs font-bold px-2 py-1 rounded-full">
              Destaque
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        {/* Store + Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              storeClass[product.store] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {product.store}
          </span>
          {category && (
            <span className="text-[11px] text-muted-foreground">{category.name}</span>
          )}
        </div>

        {/* Name */}
        <Link href={`/produto/${product.id}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {price !== null ? (
            <>
              <span className="text-lg font-bold text-primary">
                R$ {price.toFixed(2).replace(".", ",")}
              </span>
              {originalPrice !== null && originalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  R$ {originalPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Consulte o preço</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              size="sm"
              className="w-full linkbuy-gradient text-white border-0 font-semibold text-xs gap-1 hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver na loja
            </Button>
          </a>

          <Button
            size="icon"
            variant="outline"
            className={`h-8 w-8 shrink-0 transition-colors ${
              isFavorited
                ? "bg-pink-50 border-pink-200 text-pink-500 hover:bg-pink-100"
                : "hover:border-pink-200 hover:text-pink-500"
            }`}
            onClick={handleFavorite}
            title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-pink-500" : ""}`} />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className={`h-8 w-8 shrink-0 transition-colors ${
              isInCart
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                : "hover:border-primary/30 hover:text-primary"
            }`}
            onClick={handleCart}
            title={isInCart ? "Remover do carrinho" : "Adicionar ao carrinho"}
          >
            <ShoppingCart className={`h-4 w-4 ${isInCart ? "fill-primary/30" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
