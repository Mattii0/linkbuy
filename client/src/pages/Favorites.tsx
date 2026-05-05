import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart, Loader2, LogIn } from "lucide-react";
import { useMemo } from "react";

export default function Favorites() {
  const { isAuthenticated, loading } = useAuth();
  const { data: favData, isLoading } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: cartData } = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });

  const cartIds = useMemo(() => new Set(cartData?.map((c) => c.cartItem.productId) ?? []), [cartData]);

  if (loading || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full linkbuy-gradient flex items-center justify-center shadow-lg">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Seus favoritos</h2>
          <p className="text-muted-foreground">Faça login para salvar e visualizar seus produtos favoritos.</p>
        </div>
        <Button asChild size="lg" className="linkbuy-gradient text-white border-0 gap-2 font-semibold">
          <a href={getLoginUrl()}>
            <LogIn className="h-5 w-5" />
            Entrar na conta
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="linkbuy-gradient py-10">
        <div className="container">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-white fill-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Favoritos</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {favData?.length ?? 0} produto{(favData?.length ?? 0) !== 1 ? "s" : ""} salvo{(favData?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {favData && favData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favData.map(({ favorite, product, category }) => (
              <ProductCard
                key={favorite.id}
                product={product}
                category={category}
                isFavorited={true}
                isInCart={cartIds.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground mb-6">
              Explore os produtos e clique no coração para salvar seus favoritos.
            </p>
            <Button asChild className="linkbuy-gradient text-white border-0 font-semibold">
              <a href="/">Ver produtos</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
