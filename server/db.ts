import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CartItem,
  Favorite,
  InsertCartItem,
  InsertFavorite,
  InsertProduct,
  InsertUser,
  Product,
  cartItems,
  categories,
  favorites,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  search?: string;
  categoryId?: number;
  store?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(products.active, true)];

  if (opts?.search) {
    conditions.push(like(products.name, `%${opts.search}%`));
  }
  if (opts?.categoryId) {
    conditions.push(eq(products.categoryId, opts.categoryId));
  }
  if (opts?.store) {
    conditions.push(
      eq(
        products.store,
        opts.store as "Shopee" | "Amazon" | "AliExpress" | "Mercado Livre" | "Shein"
      )
    );
  }
  if (opts?.featured !== undefined) {
    conditions.push(eq(products.featured, opts.featured));
  }

  const query = db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(opts?.limit ?? 100)
    .offset(opts?.offset ?? 0);

  return query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.id, id), eq(products.active, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ active: false }).where(eq(products.id, id));
}

export async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ favorite: favorites, product: products, category: categories })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(favorites.userId, userId), eq(products.active, true)))
    .orderBy(desc(favorites.createdAt));
}

export async function addFavorite(data: InsertFavorite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Prevent duplicates
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, data.userId), eq(favorites.productId, data.productId)))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(favorites).values(data);
}

export async function removeFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
}

export async function isFavorite(userId: number, productId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .limit(1);
  return result.length > 0;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCartByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ cartItem: cartItems, product: products, category: categories })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(cartItems.userId, userId), eq(products.active, true)))
    .orderBy(desc(cartItems.createdAt));
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, data.userId), eq(cartItems.productId, data.productId)))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(cartItems).values(data);
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}
