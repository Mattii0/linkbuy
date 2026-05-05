# Linkbuy — TODO

## Backend / Banco de Dados
- [ ] Schema Drizzle: tabela products
- [ ] Schema Drizzle: tabela categories
- [ ] Schema Drizzle: tabela favorites
- [ ] Schema Drizzle: tabela cart_items
- [ ] Migração SQL aplicada via webdev_execute_sql
- [ ] db.ts: helpers para produtos (list, getById, create, update, delete)
- [ ] db.ts: helpers para favoritos (list, add, remove)
- [ ] db.ts: helpers para carrinho (list, add, remove, clear)
- [ ] routers.ts: procedures públicas de produtos (list, getById, search/filter)
- [ ] routers.ts: procedures protegidas de favoritos
- [ ] routers.ts: procedures protegidas de carrinho
- [ ] routers.ts: procedures admin (createProduct, updateProduct, deleteProduct)
- [ ] Seed de categorias e produtos de exemplo

## Frontend — Identidade Visual
- [ ] Upload da logo Linkbuy para storage
- [ ] index.css: paleta gradiente roxo/azul, tipografia, variáveis CSS
- [ ] index.html: Google Fonts (Inter/Poppins)

## Frontend — Componentes
- [ ] Header com logo Linkbuy, navegação, busca, ícones de favoritos/carrinho e login
- [ ] Footer
- [ ] ProductCard: imagem, nome, preço, desconto, loja, botão afiliado
- [ ] FilterBar: busca por nome + filtros por categoria e loja
- [ ] StoresBadge: badges das lojas com cores
- [ ] EmptyState: componente de estado vazio

## Frontend — Páginas
- [ ] Home (/) — vitrine com grid de produtos, busca e filtros
- [ ] ProductDetail (/produto/:id) — detalhes completos + botão afiliado
- [ ] Favorites (/favoritos) — lista de produtos favoritados
- [ ] Cart (/carrinho) — carrinho simulado com redirecionamento por loja
- [ ] Admin (/admin) — painel administrativo (cadastrar, editar, remover produtos)
- [ ] NotFound (404)

## Autenticação e Controle de Acesso
- [ ] Login via Manus OAuth integrado ao Header
- [ ] Rota /admin protegida para role === "admin"
- [ ] Favoritos e carrinho requerem autenticação

## Testes
- [ ] Vitest: procedures de produtos
- [ ] Vitest: procedures de favoritos
- [ ] Vitest: procedures de carrinho

## GitHub
- [ ] Repositório privado "linkbuy" criado no GitHub
- [ ] Push do código para o repositório
