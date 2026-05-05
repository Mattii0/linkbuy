# Linkbuy — TODO

## Backend / Banco de Dados
- [x] Schema Drizzle: tabela products
- [x] Schema Drizzle: tabela categories
- [x] Schema Drizzle: tabela favorites
- [x] Schema Drizzle: tabela cart_items
- [x] Migração SQL aplicada via webdev_execute_sql
- [x] db.ts: helpers para produtos (list, getById, create, update, delete)
- [x] db.ts: helpers para favoritos (list, add, remove)
- [x] db.ts: helpers para carrinho (list, add, remove, clear)
- [x] routers.ts: procedures públicas de produtos (list, getById, search/filter)
- [x] routers.ts: procedures protegidas de favoritos
- [x] routers.ts: procedures protegidas de carrinho
- [x] routers.ts: procedures admin (createProduct, updateProduct, deleteProduct)
- [x] Seed de categorias e produtos de exemplo

## Frontend — Identidade Visual
- [x] Upload da logo Linkbuy para storage
- [x] index.css: paleta gradiente roxo/azul, tipografia, variáveis CSS
- [x] index.html: Google Fonts (Inter/Poppins)

## Frontend — Componentes
- [x] Header com logo Linkbuy, navegação, busca, ícones de favoritos/carrinho e login
- [x] Footer
- [x] ProductCard: imagem, nome, preço, desconto, loja, botão afiliado
- [x] FilterBar: busca por nome + filtros por categoria e loja
- [x] StoresBadge: badges das lojas com cores
- [x] EmptyState: componente de estado vazio

## Frontend — Páginas
- [x] Home (/) — vitrine com grid de produtos, busca e filtros
- [x] ProductDetail (/produto/:id) — detalhes completos + botão afiliado
- [x] Favorites (/favoritos) — lista de produtos favoritados
- [x] Cart (/carrinho) — carrinho simulado com redirecionamento por loja
- [x] Admin (/admin) — painel administrativo (cadastrar, editar, remover produtos)
- [x] NotFound (404)

## Autenticação e Controle de Acesso
- [x] Login via Manus OAuth integrado ao Header
- [x] Rota /admin protegida para role === "admin"
- [x] Favoritos e carrinho requerem autenticação

## Testes
- [x] Vitest: procedures de produtos
- [x] Vitest: procedures de favoritos
- [x] Vitest: procedures de carrinho

## GitHub
- [x] Repositório privado "linkbuy" criado no GitHub
- [x] Push do código para o repositório
