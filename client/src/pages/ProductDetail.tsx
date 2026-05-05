import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Loader2,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const storeClass: Record<string, string> = {
  Shopee: "store-shopee",
  Amazon: "store-amazon",
  AliExpress: "store-aliexpress",
  "Mercado Livre": "store-mercadolivre",
  Shein: "store-shein",
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0", 10);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  const addFav = trpc.favorites.add.useMutation({
    onSuccess: () => { utils.products.getById.invalidate({ id: productId }); toast.success("Adicionado aos favoritos!"); },
  });
  const removeFav = trpc.favorites.remove.useMutation({
    onSuccess: () => { utils.products.getById.invalidate({ id: productId }); toast.success("Removido dos favoritos."); },
  });
  const addCart = trpc.cart.add.useMutation({
    onSuccess: () => { utils.products.getById.invalidate({ id: productId }); toast.success("Adicionado ao carrinho!"); },
  });
  const removeCart = trpc.cart.remove.useMutation({
    onSuccess: () => { utils.products.getById.invalidate({ id: productId }); toast.success("Removido do carrinho."); },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para favoritar.", { action: { label: "Entrar", onClick: () => (window.location.href = getLoginUrl()) } });
      return;
    }
    if (data?.favorited) removeFav.mutate({ productId });
    else addFav.mutate({ productId });
  };

  const handleCart = () => {
    if (!isAuthenticated) {
      toast.info("Faça login para usar o carrinho.", { action: { label: "Entrar", onClick: () => (window.location.href = getLoginUrl()) } });
      return;
    }
    if (data?.inCart) removeCart.mutate({ productId });
    else addCart.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-semibold">Produto não encontrado</h2>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  const { product, category, favorited, inCart } = data;
  const price = product.price ? parseFloat(product.price) : null;
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = product.discount ?? 0;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos produtos
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop";
                }}
              />
            </div>
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow">
                  -{discount}% OFF
                </span>
              </div>
            )}
            {product.featured && (
              <div className="absolute top-4 right-4">
                <span className="linkbuy-gradient text-white text-sm font-bold px-3 py-1.5 rounded-full shadow">
                  ⭐ Destaque
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Store + Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${storeClass[product.store] ?? "bg-muted text-muted-foreground"}`}>
                {product.store}
              </span>
              {category && (
                <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium">
                  <Tag className="h-3 w-3 inline mr-1" />
                  {category.name}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {price !== null ? (
                <>
                  <span className="text-3xl font-bold linkbuy-gradient-text">
                    R$ {price.toFixed(2).replace(".", ",")}
                  </span>
                  {originalPrice !== null && originalPrice > price && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {originalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Consulte o preço na loja</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-2">
              <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full linkbuy-gradient text-white border-0 font-bold text-base gap-2 h-12 hover:opacity-90 shadow-lg"
                >
                  <ExternalLink className="h-5 w-5" />
                  Comprar na {product.store}
                </Button>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFavorite}
                  className={`gap-2 h-11 font-semibold transition-all ${
                    favorited
                      ? "bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
                      : "hover:border-pink-200 hover:text-pink-600"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorited ? "fill-pink-500 text-pink-500" : ""}`} />
                  {favorited ? "Favoritado" : "Favoritar"}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCart}
                  className={`gap-2 h-11 font-semibold transition-all ${
                    inCart
                      ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                      : "hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <ShoppingCart className={`h-4 w-4 ${inCart ? "fill-primary/30" : ""}`} />
                  {inCart ? "No carrinho" : "Carrinho"}
                </Button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center pt-2">
              Ao clicar em "Comprar", você será redirecionado para a loja parceira através de um link de afiliado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
