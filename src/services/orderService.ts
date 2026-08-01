import { prisma } from "../lib/prisma";
import { FulfillmentStatus } from "@prisma/client";

export class StockError extends Error {
  public productName: string;
  public availableStock: number;
  public requestedQuantity: number;

  constructor(productName: string, availableStock: number, requestedQuantity: number) {
    super(`Inventory Shortage: '${productName}' has ${availableStock} available units (requested ${requestedQuantity}).`);
    this.name = "StockError";
    this.productName = productName;
    this.availableStock = availableStock;
    this.requestedQuantity = requestedQuantity;
  }
}

export interface CreateOrderItemInput {
  inventoryId?: string;
  productId?: string;
  quantity: number;
  price?: number;
  name?: string;
}

export interface CreateOrderPayload {
  userId: string;
  addressId?: string;
  items: CreateOrderItemInput[];
  notes?: string;
  couponCode?: string;
}

// In-Memory store fallback for offline/test environments
export let inMemoryFulfillments: any[] = [];
export let inMemoryOrders: any[] = [];

/**
 * Creates a split multi-vendor order using an atomic database transaction.
 */
export async function createSplitOrder(
  payload: CreateOrderPayload,
  usePrisma: boolean,
  mockInventories?: any[],
  mockStores?: any[]
) {
  const { userId, addressId, items, notes, couponCode } = payload;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order items list cannot be empty.");
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (usePrisma) {
    return await prisma.$transaction(async (tx) => {
      // Step 1: Resolve items and check stock levels
      const storeGroupMap = new Map<string, {
        storeId: string;
        items: Array<{
          inventoryId: string;
          productId: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        subtotal: number;
        tax: number;
        total: number;
      }>();

      for (const itemInput of items) {
        let inv = null;
        if (itemInput.inventoryId) {
          inv = await tx.partnerInventory.findUnique({
            where: { id: itemInput.inventoryId },
            include: { product: true, store: true }
          });
        } else if (itemInput.productId) {
          inv = await tx.partnerInventory.findFirst({
            where: { productId: itemInput.productId },
            include: { product: true, store: true }
          });
        }

        if (!inv) {
          // Fallback if item is a direct catalog product without partner store
          const prod = itemInput.productId ? await tx.product.findUnique({ where: { id: itemInput.productId } }) : null;
          const storeId = "default-store";
          const price = itemInput.price || prod?.price || 100;
          const name = itemInput.name || prod?.name || "Bespoke Pet Product";

          if (!storeGroupMap.has(storeId)) {
            storeGroupMap.set(storeId, {
              storeId,
              items: [],
              subtotal: 0,
              tax: 0,
              total: 0
            });
          }

          const group = storeGroupMap.get(storeId)!;
          const itemSubtotal = price * itemInput.quantity;
          group.items.push({
            inventoryId: itemInput.inventoryId || `inv-${itemInput.productId}`,
            productId: itemInput.productId || "unknown",
            name,
            price,
            quantity: itemInput.quantity
          });
          group.subtotal += itemSubtotal;
          continue;
        }

        // Accumulate item info without deducting stock yet
        const storeId = inv ? inv.storeId : "default-store";
        const itemPrice = inv ? (inv.price || itemInput.price || inv.product.price) : (itemInput.price || 100);
        const itemName = inv ? inv.product.name : (itemInput.name || "Bespoke Pet Product");

        if (!storeGroupMap.has(storeId)) {
          storeGroupMap.set(storeId, {
            storeId,
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0
          });
        }

        const group = storeGroupMap.get(storeId)!;
        const itemSubtotal = itemPrice * itemInput.quantity;
        group.items.push({
          inventoryId: inv ? inv.id : (itemInput.inventoryId || `inv-${itemInput.productId}`),
          productId: inv ? inv.productId : (itemInput.productId || "unknown"),
          name: itemName,
          price: itemPrice,
          quantity: itemInput.quantity
        });
        group.subtotal += itemSubtotal;
      }

      // Step 2: Calculate financial totals per store and grand total
      let grandSubtotal = 0;
      let grandTax = 0;

      for (const group of storeGroupMap.values()) {
        group.tax = Number((group.subtotal * 0.08).toFixed(2));
        group.total = Number((group.subtotal + group.tax).toFixed(2));
        grandSubtotal += group.subtotal;
        grandTax += group.tax;
      }

      let grandTotal = Number((grandSubtotal + grandTax).toFixed(2));

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
        if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses) {
          const discount = Number(((grandTotal * coupon.percent) / 100).toFixed(2));
          grandTotal = Math.max(0, grandTotal - discount);
          await tx.coupon.update({
            where: { code: coupon.code },
            data: { usedCount: { increment: 1 } }
          });
        }
      }

      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const defaultImage = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400";

      // Step 3: Create parent Order record with paymentStatus: PENDING_PAYMENT
      const parentOrder = await tx.order.create({
        data: {
          id: orderId,
          date: dateStr,
          status: "Awaiting Payment",
          total: grandTotal,
          image: defaultImage,
          userId: userId || "guest-user",
          couponCode: couponCode || null,
          addressId: addressId || null,
          paymentStatus: "PENDING_PAYMENT"
        }
      });

      // Step 4: Create OrderItem entries (fulfillments created after payment confirmation)
      for (const group of storeGroupMap.values()) {
        for (const item of group.items) {
          await tx.orderItem.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              productId: item.productId,
              orderId: parentOrder.id
            }
          });
        }
      }

      return {
        ...parentOrder,
        fulfillments: []
      };
    });
  }

  // Fallback In-Memory Implementation
  const storeGroupMap = new Map<string, any>();
  const inventories = mockInventories || [];

  for (const itemInput of items) {
    const inv = inventories.find(i => i.id === itemInput.inventoryId || i.productId === itemInput.productId);
    const storeId = inv?.storeId || "store-active-1";
    const price = inv?.price || itemInput.price || 50;
    const name = inv?.product?.name || itemInput.name || "Curated Companion Item";

    if (!storeGroupMap.has(storeId)) {
      storeGroupMap.set(storeId, {
        storeId,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0
      });
    }

    const group = storeGroupMap.get(storeId)!;
    const itemSubtotal = price * itemInput.quantity;
    group.items.push({
      inventoryId: inv?.id || itemInput.inventoryId || `inv-${Date.now()}`,
      productId: inv?.productId || itemInput.productId || "prod-1",
      name,
      price,
      quantity: itemInput.quantity
    });
    group.subtotal += itemSubtotal;
  }

  let grandSubtotal = 0;
  let grandTax = 0;

  for (const group of storeGroupMap.values()) {
    group.tax = Number((group.subtotal * 0.08).toFixed(2));
    group.total = Number((group.subtotal + group.tax).toFixed(2));
    grandSubtotal += group.subtotal;
    grandTax += group.tax;
  }

  const grandTotal = Number((grandSubtotal + grandTax).toFixed(2));
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const createdOrder = {
    id: orderId,
    date: dateStr,
    status: "Awaiting Payment",
    total: grandTotal,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
    userId,
    couponCode: couponCode || null,
    addressId: addressId || null,
    paymentStatus: "PENDING_PAYMENT",
    items: Array.from(storeGroupMap.values()).flatMap(g => g.items),
    fulfillments: []
  };

  inMemoryOrders.unshift(createdOrder);
  return createdOrder;
}

/**
 * Confirms order after payment success: validates stock, creates fulfillments, and deducts inventory stock.
 */
export async function confirmOrder(
  orderId: string,
  razorpayPaymentId?: string,
  razorpaySignature?: string,
  usePrisma = true
) {
  if (usePrisma) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found.`);
      }

      // Check stock and group items by store
      const storeGroupMap = new Map<string, any>();

      for (const item of order.items) {
        if (!item.productId) continue;
        const inv = await tx.partnerInventory.findFirst({
          where: { productId: item.productId },
          include: { product: true }
        });

        if (inv) {
          if (inv.stockQuantity < item.quantity) {
            // Stock insufficient -> Mark FAILED & trigger refund
            await tx.order.update({
              where: { id: orderId },
              data: { paymentStatus: "FAILED", status: "Cancelled" }
            });
            throw new StockError(item.name, inv.stockQuantity, item.quantity);
          }

          const storeId = inv.storeId;
          if (!storeGroupMap.has(storeId)) {
            storeGroupMap.set(storeId, {
              storeId,
              items: [],
              subtotal: 0,
              tax: 0,
              total: 0
            });
          }

          const group = storeGroupMap.get(storeId)!;
          const sub = item.price * item.quantity;
          group.items.push({
            inventoryId: inv.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          });
          group.subtotal += sub;

          // Deduct stock
          await tx.partnerInventory.update({
            where: { id: inv.id },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }
      }

      // Create fulfillments per store
      const fulfillments = [];
      for (const group of storeGroupMap.values()) {
        group.tax = Number((group.subtotal * 0.08).toFixed(2));
        group.total = Number((group.subtotal + group.tax).toFixed(2));

        const ful = await tx.fulfillment.create({
          data: {
            orderId: order.id,
            storeId: group.storeId,
            status: "PENDING",
            items: group.items,
            subtotal: group.subtotal,
            tax: group.tax,
            total: group.total
          },
          include: { store: true }
        });
        fulfillments.push(ful);
      }

      // Update Order paymentStatus to PAID
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "Processing",
          paidAt: new Date(),
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null
        },
        include: { fulfillments: true, items: true }
      });

      return updatedOrder;
    });
  }

  // Fallback In-Memory implementation
  const order = inMemoryOrders.find(o => o.id === orderId || o.razorpayOrderId === orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  order.paymentStatus = "PAID";
  order.status = "Processing";
  order.paidAt = new Date();
  order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;

  // Generate fulfillments for in-memory order
  const storeId = "store-active-1";
  const ful = {
    id: `ful-${Date.now()}`,
    orderId: order.id,
    storeId,
    status: "PENDING",
    items: order.items || [],
    subtotal: order.total * 0.92,
    tax: order.total * 0.08,
    total: order.total,
    createdAt: new Date(),
    store: { businessName: "Bark & Purr Boutique", address: "New York, NY" }
  };
  order.fulfillments = [ful];
  inMemoryFulfillments.unshift(ful);

  return order;
}

/**
 * Retrieves store fulfillments for a partner.
 */
export async function getPartnerFulfillments(
  storeId: string,
  status?: string,
  limit: number = 50,
  offset: number = 0,
  usePrisma: boolean = false
) {
  if (usePrisma) {
    const whereClause: any = { storeId };
    if (status) {
      whereClause.status = status as FulfillmentStatus;
    }

    const [total, fulfillments] = await Promise.all([
      prisma.fulfillment.count({ where: whereClause }),
      prisma.fulfillment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          order: {
            include: {
              items: true,
              user: true,
              address: true
            }
          },
          store: true
        }
      })
    ]);

    return { total, fulfillments };
  }

  // Fallback In-Memory
  let filtered = inMemoryFulfillments.filter(f => f.storeId === storeId);
  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }

  const total = filtered.length;
  const fulfillments = filtered.slice(offset, offset + limit);
  return { total, fulfillments };
}

/**
 * Updates a fulfillment status for a partner store.
 */
export async function updateFulfillmentStatus(
  fulfillmentId: string,
  status: FulfillmentStatus,
  storeId: string,
  usePrisma: boolean = false
) {
  if (usePrisma) {
    const ful = await prisma.fulfillment.findUnique({
      where: { id: fulfillmentId }
    });

    if (!ful) {
      throw new Error("Fulfillment record not found.");
    }

    if (ful.storeId !== storeId) {
      const err: any = new Error("Forbidden: You do not own the store associated with this fulfillment.");
      err.code = "FORBIDDEN";
      throw err;
    }

    const updateData: any = { status };
    if (status === "READY") {
      updateData.readyAt = new Date();
    }

    const updated = await prisma.fulfillment.update({
      where: { id: fulfillmentId },
      data: updateData,
      include: {
        order: {
          include: {
            user: true,
            address: true
          }
        },
        store: true
      }
    });

    return updated;
  }

  // Fallback in-memory
  const ful = inMemoryFulfillments.find(f => f.id === fulfillmentId);
  if (!ful) {
    throw new Error("Fulfillment record not found.");
  }
  if (ful.storeId !== storeId) {
    const err: any = new Error("Forbidden: You do not own the store associated with this fulfillment.");
    err.code = "FORBIDDEN";
    throw err;
  }

  ful.status = status;
  ful.updatedAt = new Date().toISOString();
  if (status === "READY") {
    ful.readyAt = new Date().toISOString();
  }

  return ful;
}

/**
 * Customer action: Marks a ready fulfillment as COMPLETED upon pickup.
 */
export async function completeFulfillment(
  fulfillmentId: string,
  userId: string,
  usePrisma: boolean = false
) {
  if (usePrisma) {
    const ful = await prisma.fulfillment.findUnique({
      where: { id: fulfillmentId },
      include: { order: true }
    });

    if (!ful) {
      throw new Error("Fulfillment record not found.");
    }

    if (ful.order.userId !== userId) {
      const err: any = new Error("Forbidden: Order does not belong to user.");
      err.code = "FORBIDDEN";
      throw err;
    }

    const updated = await prisma.fulfillment.update({
      where: { id: fulfillmentId },
      data: {
        status: "COMPLETED",
        pickedUpAt: new Date()
      },
      include: {
        order: true,
        store: true
      }
    });

    return updated;
  }

  // Fallback in-memory
  const ful = inMemoryFulfillments.find(f => f.id === fulfillmentId);
  if (!ful) {
    throw new Error("Fulfillment record not found.");
  }

  ful.status = "COMPLETED";
  ful.pickedUpAt = new Date().toISOString();
  ful.updatedAt = new Date().toISOString();
  return ful;
}
