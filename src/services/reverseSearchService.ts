import { GoogleGenAI } from "@google/genai";
import { prisma } from "../lib/prisma";
import { cacheService } from "./cacheService";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface ReverseSearchResult {
  query: {
    productName: string;
    brand: string | null;
    category: string | null;
    petType: string | null;
    confidence: number;
  };
  matches: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    image: string;
    matchScore: number;
    availability?: Array<{
      storeId: string;
      storeName: string;
      storeAddress: string;
      price: number;
      stockQuantity: number;
      distance?: number;
    }>;
  }>;
  cached: boolean;
}

/**
 * Step 1: Use Gemini to analyze the uploaded consumer photo and extract
 * product identifiers (name, brand, category).
 */
export async function analyzeConsumerPhoto(imageUrl: string): Promise<{
  productName: string;
  brand: string | null;
  category: string | null;
  petType: string | null;
  keywords: string[];
  confidence: number;
}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment.");
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg"
        }
      },
      `You are analyzing a consumer photo of a pet product — it could be an empty food bag, a chewed toy, a worn-out leash, product packaging, or a label. Your goal is to identify the product so we can find it in our catalog.

Extract:
1. productName: The product name visible on the packaging/label, or your best description
2. brand: The brand/manufacturer if visible (null if unknown)
3. category: One of "dogs", "cats", "eco-friendly", "essentials" (null if unclear)
4. petType: "dog", "cat", or "both" (null if unclear)
5. keywords: An array of 3-8 search keywords to find this product in a catalog (include product type, brand fragments, key descriptors)
6. confidence: Your confidence in the identification from 0.0 to 1.0

Respond ONLY with valid JSON matching this schema:
{
  "productName": string,
  "brand": string | null,
  "category": string | null,
  "petType": string | null,
  "keywords": string[],
  "confidence": number
}`
    ],
    config: {
      temperature: 0.1,
      topP: 0.95,
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Received empty response from Gemini API");
  }

  return JSON.parse(text);
}

/**
 * Step 2: Search the product catalog using extracted keywords.
 * Uses PostgreSQL full-text search when available, falls back to in-memory fuzzy matching.
 */
export async function searchCatalog(
  keywords: string[],
  brand: string | null,
  category: string | null,
  usePrismaFlag: boolean,
  mockProducts: any[]
): Promise<Array<{ id: string; name: string; brand: string; category: string; price: number; image: string; matchScore: number }>> {

  if (usePrismaFlag) {
    try {
      const searchTerms = keywords.join(" ");

      // Use raw SQL full-text search with plainto_tsquery for syntax safety and ts_rank for scoring
      const results: any[] = await prisma.$queryRaw`
        SELECT id, name, brand, category, price, image,
               ts_rank("searchVector", plainto_tsquery('english', ${searchTerms})) as rank_score
        FROM "Product"
        WHERE "searchVector" @@ plainto_tsquery('english', ${searchTerms})
           OR name ILIKE ${'%' + keywords[0] + '%'}
           OR brand ILIKE ${'%' + (brand || keywords[0]) + '%'}
        ORDER BY rank_score DESC
        LIMIT 20
      `;

      return results.map(r => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        category: r.category,
        price: r.price,
        image: r.image,
        matchScore: Math.min(1, (r.rank_score || 0.1) * 10)
      }));
    } catch (err) {
      console.error("Full-text search failed, falling back to in-memory:", err);
    }
  }

  // In-memory fuzzy search fallback
  const normalizedKeywords = keywords.map(k => k.toLowerCase());

  const scored = mockProducts.map(product => {
    let score = 0;
    const searchableText = `${product.name} ${product.brand} ${product.category} ${(product.tags || []).join(" ")}`.toLowerCase();

    for (const keyword of normalizedKeywords) {
      if (searchableText.includes(keyword)) {
        score += 1;
      }
    }

    // Boost exact brand match
    if (brand && product.brand.toLowerCase() === brand.toLowerCase()) {
      score += 3;
    }

    // Boost category match
    if (category && product.category.toLowerCase() === category.toLowerCase()) {
      score += 2;
    }

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      image: product.image,
      matchScore: Math.min(1, score / (normalizedKeywords.length + 3))
    };
  }).filter(p => p.matchScore > 0);

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 20);
}

/**
 * Step 3: Find local availability for matched products by checking
 * PartnerInventory entries from active stores.
 */
export async function findLocalAvailability(
  productIds: string[],
  userLat?: number,
  userLng?: number,
  usePrismaFlag: boolean = false,
  mockInventories: any[] = [],
  mockStores: any[] = []
): Promise<Map<string, Array<{ storeId: string; storeName: string; storeAddress: string; price: number; stockQuantity: number; distance?: number }>>> {

  const availabilityMap = new Map<string, any[]>();

  if (usePrismaFlag) {
    try {
      const inventories = await prisma.partnerInventory.findMany({
        where: {
          productId: { in: productIds },
          store: { approvalStatus: "ACTIVE" },
          stockQuantity: { gt: 0 }
        },
        include: {
          store: { select: { id: true, businessName: true, address: true, lat: true, lng: true } }
        }
      });

      for (const inv of inventories) {
        const entry = {
          storeId: inv.store.id,
          storeName: inv.store.businessName,
          storeAddress: inv.store.address,
          price: inv.price,
          stockQuantity: inv.stockQuantity,
          distance: (userLat && userLng && inv.store.lat && inv.store.lng)
            ? haversineDistance(userLat, userLng, inv.store.lat, inv.store.lng)
            : undefined
        };

        if (!availabilityMap.has(inv.productId)) {
          availabilityMap.set(inv.productId, []);
        }
        availabilityMap.get(inv.productId)!.push(entry);
      }

      // Sort each product's stores by distance
      for (const [, stores] of availabilityMap) {
        stores.sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      return availabilityMap;
    } catch (err) {
      console.error("Local availability query failed:", err);
    }
  }

  // In-memory fallback
  for (const productId of productIds) {
    const inventories = mockInventories.filter(i => i.productId === productId);
    const entries: any[] = [];

    for (const inv of inventories) {
      const store = mockStores.find((s: any) => s.id === inv.storeId);
      if (!store || store.approvalStatus !== "ACTIVE") continue;

      entries.push({
        storeId: store.id,
        storeName: store.businessName,
        storeAddress: store.address,
        price: inv.price,
        stockQuantity: inv.stockQuantity,
        distance: (userLat && userLng && store.lat && store.lng)
          ? haversineDistance(userLat, userLng, store.lat, store.lng)
          : undefined
      });
    }

    entries.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    if (entries.length > 0) {
      availabilityMap.set(productId, entries);
    }
  }

  return availabilityMap;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
