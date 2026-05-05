import { useAuth } from "@/_core/hooks/useAuth";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Filter, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

const STORES = ["Shopee", "Amazon", "AliExpress", "Mercado Livre", "Shein"] as const;

const storeEmoji: Record<string, string> = {
  Shopee: "🛍️",
  Amazon: "📦",
  AliExpress: "✈️",
  "Mercado Livre": "🟡",
  Shein: "👗",
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedStore, setSelectedStore] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery({
    search: search || undefined,
    categoryId: selectedCategory,
    store: selectedStore as any,
    limit: 60,
  });
  const { data: featured } = trpc.products.list.useQuery({ featured: true, limit: 8 });
  const { data: favData } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cartData } = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });

  const favIds = useMemo(() => new Set(favData?.map((f) => f.favorite.productId) ?? []), [favData]);
  const cartIds = useMemo(() => new Set(cartData?.map((c) => c.cartItem.productId) ?? []), [cartData]);

  const hasFilters = !!search || !!selectedCategory || !!selectedStore;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSelectedStore(undefined);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="linkbuy-gradient py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Novos produtos toda semana
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Os melhores produtos
            <br />
            <span className="text-yellow-300">em um só lugar</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Curadoria de ofertas das maiores lojas do Brasil. Clique e seja redirecionado direto para comprar.
          </p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 h-12 text-base bg-white border-0 shadow-lg rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Store chips */}
      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedStore(undefined)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                !selectedStore
                  ? "linkbuy-gradient text-white border-transparent shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              Todas as lojas
            </button>
            {STORES.map((store) => (
              <button
                key={store}
                onClick={() => setSelectedStore(selectedStore === store ? undefined : store)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedStore === store
                    ? "linkbuy-gradient text-white border-transparent shadow-sm"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                <span>{storeEmoji[store]}</span>
                {store}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Featured section — only when no filters active */}
        {!hasFilters && featured && featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Em Destaque</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Seleção especial da curadoria Linkbuy</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(({ product, category }) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={category}
                  isFavorited={favIds.has(product.id)}
                  isInCart={cartIds.has(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {hasFilters ? "Resultados" : "Todos os Produtos"}
            </h2>
            {products && (
              <span className="text-sm text-muted-foreground">({products.length})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Categorias
            </Button>
          </div>
        </div>

        {/* Category filter */}
        {showFilters && categories && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-xl border shadow-sm">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                !selectedCategory
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(({ product, category }) => (
              <ProductCard
                key={product.id}
                product={product}
                category={category}
                isFavorited={favIds.has(product.id)}
                isInCart={cartIds.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
            <Button onClick={clearFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
