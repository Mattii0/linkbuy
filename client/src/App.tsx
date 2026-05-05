import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/produto/:id" component={ProductDetail} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
