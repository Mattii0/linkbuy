import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/manus-storage/linkbuy_logo_59a2c4dc.png"
                alt="Linkbuy"
                className="h-8 w-8 object-contain brightness-0 invert"
              />
              <span className="text-xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                Linkbuy
              </span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              Curadoria de produtos afiliados das melhores lojas do Brasil. Encontre as melhores ofertas em um só lugar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/favoritos" className="hover:text-white transition-colors">Favoritos</Link></li>
              <li><Link href="/carrinho" className="hover:text-white transition-colors">Carrinho</Link></li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Lojas Parceiras</h4>
            <ul className="space-y-2 text-sm">
              {["Shopee", "Amazon", "AliExpress", "Mercado Livre", "Shein"].map((store) => (
                <li key={store}>
                  <span className="hover:text-white transition-colors cursor-default">{store}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-xs text-background/40">
          <p>© {new Date().getFullYear()} Linkbuy. Os links deste site são links de afiliados. Ao clicar, você será redirecionado para a loja parceira.</p>
        </div>
      </div>
    </footer>
  );
}
