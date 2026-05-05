import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Context helpers ──────────────────────────────────────────────────────────

function makeCtx(role: "user" | "admin" | null = null): TrpcContext {
  const user =
    role !== null
      ? {
          id: role === "admin" ? 1 : 2,
          openId: role === "admin" ? "admin-open-id" : "user-open-id",
          email: `${role}@linkbuy.test`,
          name: role === "admin" ? "Admin Linkbuy" : "Usuário Comum",
          loginMethod: "manus",
          role: role as "user" | "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("retorna null quando não autenticado", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("retorna o usuário autenticado", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("user");
  });

  it("retorna admin quando role é admin", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
  });
});

describe("auth.logout", () => {
  it("limpa o cookie de sessão e retorna sucesso", async () => {
    const cleared: string[] = [];
    const ctx = makeCtx("user");
    ctx.res.clearCookie = (name: string) => { cleared.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(cleared).toContain(COOKIE_NAME);
  });
});

// ─── Admin guard ──────────────────────────────────────────────────────────────

describe("products.listAdmin — controle de acesso", () => {
  it("rejeita usuário comum com FORBIDDEN", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.products.listAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejeita não-autenticado com UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.products.listAdmin()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("products.create — controle de acesso", () => {
  const validProduct = {
    name: "Produto Teste",
    image: "https://example.com/img.jpg",
    affiliateLink: "https://shopee.com.br/produto",
    store: "Shopee" as const,
  };

  it("rejeita usuário comum com FORBIDDEN", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.products.create(validProduct)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("products.delete — controle de acesso", () => {
  it("rejeita usuário comum com FORBIDDEN", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.products.delete({ id: 1 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

// ─── Favorites guard ──────────────────────────────────────────────────────────

describe("favorites — autenticação obrigatória", () => {
  it("rejeita listagem sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.favorites.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejeita add sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.favorites.add({ productId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejeita remove sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.favorites.remove({ productId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Cart guard ───────────────────────────────────────────────────────────────

describe("cart — autenticação obrigatória", () => {
  it("rejeita listagem sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cart.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejeita add sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cart.add({ productId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejeita clear sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cart.clear()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("products.create — validação de campos", () => {
  it("rejeita produto com nome muito curto", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.products.create({
        name: "A",
        image: "https://example.com/img.jpg",
        affiliateLink: "https://shopee.com.br",
        store: "Shopee",
      })
    ).rejects.toThrow();
  });

  it("rejeita produto com URL de imagem inválida", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.products.create({
        name: "Produto Válido",
        image: "nao-e-uma-url",
        affiliateLink: "https://shopee.com.br",
        store: "Shopee",
      })
    ).rejects.toThrow();
  });

  it("rejeita produto com desconto acima de 100", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.products.create({
        name: "Produto Válido",
        image: "https://example.com/img.jpg",
        affiliateLink: "https://shopee.com.br",
        store: "Shopee",
        discount: 150,
      })
    ).rejects.toThrow();
  });
});
