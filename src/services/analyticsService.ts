import { prisma } from "../lib/prisma";

/**
 * Records a click event for a partner inventory item.
 * Uses upsert to create or increment the daily analytics record.
 */
export async function recordClick(partnerInventoryId: string): Promise<void> {
  const today = getDateOnly(new Date());
  try {
    await prisma.inventoryAnalytics.upsert({
      where: {
        partnerInventoryId_date: { partnerInventoryId, date: today }
      },
      update: { clicks: { increment: 1 } },
      create: { partnerInventoryId, date: today, clicks: 1 }
    });
  } catch (err) {
    console.error("Analytics recordClick error:", err);
  }
}

/**
 * Records an add-to-cart event for a partner inventory item.
 */
export async function recordAddToCart(partnerInventoryId: string): Promise<void> {
  const today = getDateOnly(new Date());
  try {
    await prisma.inventoryAnalytics.upsert({
      where: {
        partnerInventoryId_date: { partnerInventoryId, date: today }
      },
      update: { addToCarts: { increment: 1 } },
      create: { partnerInventoryId, date: today, addToCarts: 1 }
    });
  } catch (err) {
    console.error("Analytics recordAddToCart error:", err);
  }
}

/**
 * Records a conversion (purchase) event for a partner inventory item.
 */
export async function recordConversion(partnerInventoryId: string): Promise<void> {
  const today = getDateOnly(new Date());
  try {
    await prisma.inventoryAnalytics.upsert({
      where: {
        partnerInventoryId_date: { partnerInventoryId, date: today }
      },
      update: { conversions: { increment: 1 } },
      create: { partnerInventoryId, date: today, conversions: 1 }
    });
  } catch (err) {
    console.error("Analytics recordConversion error:", err);
  }
}

/**
 * Calculates the engagement score for a single inventory item
 * over the given 7-day period.
 * 
 * Formula: score = min(100, (clicks * 1) + (addToCarts * 3) + (conversions * 10))
 * Weighted to reward deeper funnel engagement.
 */
export function calculateEngagementScore(clicks: number, addToCarts: number, conversions: number): number {
  const raw = (clicks * 1) + (addToCarts * 3) + (conversions * 10);
  return Math.min(100, raw);
}

/**
 * Runs the weekly scoring job:
 * 1. Aggregates InventoryAnalytics for the past 7 days per inventory item.
 * 2. Computes an engagement score (0-100).
 * 3. Ranks items within each partner store.
 * 4. Upserts EngagementScore records.
 * 
 * Returns the number of scores computed.
 */
export async function runWeeklyScoringJob(): Promise<number> {
  const now = new Date();
  const weekStart = getMondayOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Aggregate analytics per inventory item for the week
  const aggregated = await prisma.inventoryAnalytics.groupBy({
    by: ["partnerInventoryId"],
    where: {
      date: { gte: weekStart, lt: weekEnd }
    },
    _sum: {
      clicks: true,
      addToCarts: true,
      conversions: true
    }
  });

  if (aggregated.length === 0) return 0;

  // Calculate scores
  const scored = aggregated.map(item => ({
    partnerInventoryId: item.partnerInventoryId,
    score: calculateEngagementScore(
      item._sum.clicks || 0,
      item._sum.addToCarts || 0,
      item._sum.conversions || 0
    )
  }));

  // Get store associations for ranking within each store
  const inventoryItems = await prisma.partnerInventory.findMany({
    where: { id: { in: scored.map(s => s.partnerInventoryId) } },
    select: { id: true, storeId: true }
  });

  const storeMap = new Map<string, string>();
  for (const item of inventoryItems) {
    storeMap.set(item.id, item.storeId);
  }

  // Group by store for ranking
  const storeGroups = new Map<string, typeof scored>();
  for (const s of scored) {
    const storeId = storeMap.get(s.partnerInventoryId) || "unknown";
    if (!storeGroups.has(storeId)) storeGroups.set(storeId, []);
    storeGroups.get(storeId)!.push(s);
  }

  // Sort within each store and assign ranks
  const rankedScores: Array<{ partnerInventoryId: string; score: number; rank: number }> = [];
  for (const [, items] of storeGroups) {
    items.sort((a, b) => b.score - a.score);
    items.forEach((item, idx) => {
      rankedScores.push({ ...item, rank: idx + 1 });
    });
  }

  // Upsert engagement scores
  let count = 0;
  for (const entry of rankedScores) {
    await prisma.engagementScore.upsert({
      where: {
        partnerInventoryId_weekStart: {
          partnerInventoryId: entry.partnerInventoryId,
          weekStart
        }
      },
      update: { score: entry.score, rank: entry.rank },
      create: {
        partnerInventoryId: entry.partnerInventoryId,
        weekStart,
        score: entry.score,
        rank: entry.rank
      }
    });
    count++;
  }

  console.log(`[WeeklyScoringJob] Computed ${count} engagement scores for week starting ${weekStart.toISOString()}`);
  return count;
}

/**
 * Retrieves analytics summary for a specific partner's inventory items
 * for the last N days.
 */
export async function getPartnerAnalyticsSummary(storeId: string, days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const inventoryItems = await prisma.partnerInventory.findMany({
    where: { storeId },
    select: { id: true, product: { select: { name: true, brand: true } } }
  });

  if (inventoryItems.length === 0) return [];

  const analytics = await prisma.inventoryAnalytics.groupBy({
    by: ["partnerInventoryId"],
    where: {
      partnerInventoryId: { in: inventoryItems.map(i => i.id) },
      date: { gte: since }
    },
    _sum: {
      clicks: true,
      addToCarts: true,
      conversions: true
    }
  });

  return inventoryItems.map(item => {
    const stats = analytics.find(a => a.partnerInventoryId === item.id);
    const clicks = stats?._sum.clicks || 0;
    const addToCarts = stats?._sum.addToCarts || 0;
    const conversions = stats?._sum.conversions || 0;
    return {
      inventoryId: item.id,
      productName: item.product.name,
      brand: item.product.brand,
      clicks,
      addToCarts,
      conversions,
      engagementScore: calculateEngagementScore(clicks, addToCarts, conversions)
    };
  });
}

/**
 * Identifies low-performing inventory items that need attention.
 * Returns items with engagement score below the threshold.
 */
export async function getLowPerformingItems(storeId: string, threshold: number = 10) {
  const summary = await getPartnerAnalyticsSummary(storeId, 7);
  return summary.filter(item => item.engagementScore < threshold);
}

// --- Utility helpers ---

function getDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date.setDate(diff));
  return getDateOnly(monday);
}
