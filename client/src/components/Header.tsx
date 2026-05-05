import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cartData } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: favData } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartCount = cartData?.length ?? 0;
  const favCount = favData?.length ?? 0;

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/carrinho", label: "Carrinho" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Gradient bar */}
      <div className="linkbuy-gradient">
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/manus-storage/linkbuy_logo_59a2c4dc.png"
                alt="Linkbuy"
                className="h-9 w-9 object-contain drop-shadow"
              />
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Linkbuy
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Favorites */}
                  <Link href="/favoritos">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-white hover:bg-white/20 hover:text-white"
                    >
                      <Heart className="h-5 w-5" />
                      {favCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {favCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* Cart */}
                  <Link href="/carrinho">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-white hover:bg-white/20 hover:text-white"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 hover:text-white rounded-full"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                          {user?.name?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="flex items-center gap-2 cursor-pointer">
                          <Heart className="h-4 w-4" />
                          Favoritos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/carrinho" className="flex items-center gap-2 cursor-pointer">
                          <ShoppingCart className="h-4 w-4" />
                          Carrinho
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "admin" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2 cursor-pointer font-medium text-primary">
                              Painel Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="text-destructive focus:text-destructive flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-sm"
                >
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
