import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addFavorite,
  addToCart,
  clearCart,
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getCartByUser,
  getCategories,
  getFavoritesByUser,
  getProductById,
  getProducts,
  isFavorite,
  removeFavorite,
  removeFromCart,
  updateProduct,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

// ─── Store enum ───────────────────────────────────────────────────────────────

const StoreEnum = z.enum(["Shopee", "Amazon", "AliExpress", "Mercado Livre", "Shein"]);

// ─── Product input ────────────────────────────────────────────────────────────

const productInput = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  image: z.string().url(),
  affiliateLink: z.string().url(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  store: StoreEnum,
  categoryId: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────

  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),
  }),

  // ─── Products ───────────────────────────────────────────────────────────────

  products: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          categoryId: z.number().int().positive().optional(),
          store: StoreEnum.optional(),
          featured: z.boolean().optional(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
        })
      )
      .query(async ({ input }) => {
        return getProducts(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const result = await getProductById(input.id);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });

        let favorited = false;
        let inCart = false;
        if (ctx.user) {
          favorited = await isFavorite(ctx.user.id, input.id);
          const cart = await getCartByUser(ctx.user.id);
          inCart = cart.some((c) => c.cartItem.productId === input.id);
        }

        return { ...result, favorited, inCart };
      }),

    // Admin procedures
    listAdmin: adminProcedure.query(async () => {
      return getAllProductsAdmin();
    }),

    create: adminProcedure.input(productInput).mutation(async ({ input }) => {
      await createProduct({
        name: input.name,
        description: input.description ?? null,
        image: input.image,
        affiliateLink: input.affiliateLink,
        price: input.price ? String(input.price) : null,
        originalPrice: input.originalPrice ? String(input.originalPrice) : null,
        discount: input.discount ?? 0,
        store: input.store,
        categoryId: input.categoryId ?? null,
        featured: input.featured ?? false,
        active: true,
      });
      return { success: true };
    }),

    update: adminProcedure
      .input(z.object({ id: z.number().int().positive() }).merge(productInput.partial()))
      .mutation(async ({ input }) => {
        const { id, price, originalPrice, ...rest } = input;
        await updateProduct(id, {
          ...rest,
          price: price !== undefined ? String(price) : undefined,
          originalPrice: originalPrice !== undefined ? String(originalPrice) : undefined,
        });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ─── Favorites ──────────────────────────────────────────────────────────────

  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getFavoritesByUser(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite({ userId: ctx.user.id, productId: input.productId });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.productId);
        return { success: true };
      }),

    check: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        return isFavorite(ctx.user.id, input.productId);
      }),
  }),

  // ─── Cart ────────────────────────────────────────────────────────────────────

  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCartByUser(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addToCart({ userId: ctx.user.id, productId: input.productId });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await removeFromCart(ctx.user.id, input.productId);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
