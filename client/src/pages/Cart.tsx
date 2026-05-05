import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, LogIn, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { Link } from "wouter";

const storeClass: Record<string, string> = {
  Shopee: "store-shopee",
  Amazon: "store-amazon",
  AliExpress: "store-aliexpress",
  "Mercado Livre": "store-mercadolivre",
  Shein: "store-shein",
};

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: cartData, isLoading } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Item removido do carrinho.");
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Carrinho limpo.");
    },
  });

  // Group by store
  const byStore = useMemo(() => {
    if (!cartData) return {};
    return cartData.reduce<Record<string, typeof cartData>>((acc, item) => {
      const store = item.product.store;
      if (!acc[store]) acc[store] = [];
      acc[store].push(item);
      return acc;
    }, {});
  }, [cartData]);

  const totalPrice = useMemo(() => {
    return cartData?.reduce((sum, item) => {
      return sum + (item.product.price ? parseFloat(item.product.price) : 0);
    }, 0) ?? 0;
  }, [cartData]);

  const handleOpenAllLinks = () => {
    if (!cartData?.length) return;
    cartData.forEach((item, i) => {
      setTimeout(() => {
        window.open(item.product.affiliateLink, "_blank", "noopener,noreferrer");
      }, i * 300);
    });
    toast.success(`Abrindo ${cartData.length} loja${cartData.length > 1 ? "s" : ""}...`);
  };

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
          <ShoppingCart className="h-10 w-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Carrinho</h2>
          <p className="text-muted-foreground">Faça login para montar seu carrinho de produtos.</p>
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
            <ShoppingCart className="h-8 w-8 text-white fill-white/30" />
            <div>
              <h1 className="text-3xl font-bold text-white">Carrinho</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {cartData?.length ?? 0} produto{(cartData?.length ?? 0) !== 1 ? "s" : ""} selecionado{(cartData?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {cartData && cartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {Object.entries(byStore).map(([store, items]) => (
                <div key={store} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className={`px-4 py-3 flex items-center gap-2 border-b ${storeClass[store] ?? "bg-muted"}`}>
                    <span className="font-semibold text-sm">{store}</span>
                    <span className="text-xs opacity-70">({items.length} item{items.length > 1 ? "s" : ""})</span>
                  </div>
                  <div className="divide-y">
                    {items.map(({ cartItem, product, category }) => {
                      const price = product.price ? parseFloat(product.price) : null;
                      const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
                      return (
                        <div key={cartItem.id} className="flex items-center gap-4 p-4">
                          <Link href={`/produto/${product.id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg bg-muted shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop";
                              }}
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/produto/${product.id}`}>
                              <p className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                                {product.name}
                              </p>
                            </Link>
                            {category && (
                              <p className="text-xs text-muted-foreground mt-0.5">{category.name}</p>
                            )}
                            <div className="flex items-baseline gap-2 mt-1">
                              {price !== null ? (
                                <>
                                  <span className="text-sm font-bold text-primary">
                                    R$ {price.toFixed(2).replace(".", ",")}
                                  </span>
                                  {originalPrice !== null && originalPrice > price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      R$ {originalPrice.toFixed(2).replace(".", ",")}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Consulte o preço</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ver
                              </Button>
                            </a>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem.mutate({ productId: product.id })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Resumo</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Produtos</span>
                    <span className="font-medium">{cartData.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lojas</span>
                    <span className="font-medium">{Object.keys(byStore).length}</span>
                  </div>
                  {totalPrice > 0 && (
                    <div className="flex justify-between text-sm border-t pt-3">
                      <span className="font-semibold">Total estimado</span>
                      <span className="font-bold text-primary">
                        R$ {totalPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleOpenAllLinks}
                    size="lg"
                    className="w-full linkbuy-gradient text-white border-0 font-bold gap-2 hover:opacity-90"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Ir às lojas ({Object.keys(byStore).length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive gap-2"
                    onClick={() => clearCart.mutate()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar carrinho
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                  Ao clicar em "Ir às lojas", você será redirecionado para cada loja individualmente através de links de afiliado.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Carrinho vazio</h3>
            <p className="text-muted-foreground mb-6">
              Adicione produtos ao carrinho para acessar as lojas de uma vez só.
            </p>
            <Button asChild className="linkbuy-gradient text-white border-0 font-semibold">
              <a href="/">Explorar produtos</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
