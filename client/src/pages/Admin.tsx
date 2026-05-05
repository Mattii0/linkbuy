import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Edit,
  Loader2,
  Package,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STORES = ["Shopee", "Amazon", "AliExpress", "Mercado Livre", "Shein"] as const;

type ProductForm = {
  name: string;
  description: string;
  image: string;
  affiliateLink: string;
  price: string;
  originalPrice: string;
  discount: string;
  store: string;
  categoryId: string;
  featured: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  image: "",
  affiliateLink: "",
  price: "",
  originalPrice: "",
  discount: "0",
  store: "",
  categoryId: "",
  featured: false,
};

const storeClass: Record<string, string> = {
  Shopee: "store-shopee",
  Amazon: "store-amazon",
  AliExpress: "store-aliexpress",
  "Mercado Livre": "store-mercadolivre",
  Shein: "store-shein",
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading } = trpc.products.listAdmin.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      utils.products.list.invalidate();
      toast.success("Produto criado com sucesso!");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      utils.products.list.invalidate();
      toast.success("Produto atualizado!");
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.listAdmin.invalidate();
      utils.products.list.invalidate();
      toast.success("Produto removido.");
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.image || !form.affiliateLink || !form.store) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      image: form.image,
      affiliateLink: form.affiliateLink,
      price: form.price ? parseFloat(form.price) : undefined,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      discount: form.discount ? parseInt(form.discount) : 0,
      store: form.store as any,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      featured: form.featured,
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      image: product.image,
      affiliateLink: product.affiliateLink,
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      discount: String(product.discount ?? 0),
      store: product.store,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Esta área é exclusiva para administradores do Linkbuy.</p>
        </div>
        <Link href="/">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="linkbuy-gradient py-10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-white/70 text-sm mt-0.5">
                  {products?.length ?? 0} produto{(products?.length ?? 0) !== 1 ? "s" : ""} cadastrado{(products?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              onClick={openCreate}
              className="bg-white text-primary hover:bg-white/90 font-bold gap-2 shadow"
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Produto</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Loja</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Categoria</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Preço</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(({ product, category }) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                            {product.featured && (
                              <span className="text-[10px] linkbuy-gradient-text font-bold">⭐ Destaque</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${storeClass[product.store] ?? "bg-muted"}`}>
                          {product.store}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {product.price ? (
                          <span className="font-semibold text-primary">
                            R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => openEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => setDeleteConfirm(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground mb-6">Clique em "Novo Produto" para começar.</p>
            <Button onClick={openCreate} className="linkbuy-gradient text-white border-0 gap-2 font-semibold">
              <Plus className="h-4 w-4" />
              Criar primeiro produto
            </Button>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name">Nome do produto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Fone Bluetooth Premium"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o produto..."
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="image">URL da imagem *</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="affiliateLink">Link de afiliado *</Label>
                <Input
                  id="affiliateLink"
                  value={form.affiliateLink}
                  onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store">Loja *</Label>
                <Select value={form.store} onValueChange={(v) => setForm({ ...form, store: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">Preço original (R$)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label htmlFor="featured" className="cursor-pointer">Produto em destaque</Label>
              </div>
            </div>

            {/* Preview */}
            {form.image && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-14 h-14 object-cover rounded-lg bg-muted"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{form.name || "Nome do produto"}</p>
                  {form.price && (
                    <p className="text-sm text-primary font-bold">
                      R$ {parseFloat(form.price).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setDialogOpen(false); setEditingId(null); setForm(emptyForm); }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 linkbuy-gradient text-white border-0 font-bold"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {(createProduct.isPending || updateProduct.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingId ? "Salvar alterações" : "Criar produto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover produto?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação irá desativar o produto. Ele não será mais exibido no site.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && deleteProduct.mutate({ id: deleteConfirm })}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
