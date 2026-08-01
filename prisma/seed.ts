import { PrismaClient } from "@prisma/client";
import { MOCK_PRODUCTS } from "../src/types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Admin User
  const adminEmail = "admin@thepawsstore.com";
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Marketplace Admin",
        username: "admin",
        password: "Admin@123", // plaintext password as requested
        role: "ADMIN",
      },
    });
    console.log(`✅ Seeded admin user: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  }

  // 1.5 Seed Default VIP Curator (Sarah)
  const sarahEmail = "sarah.curator@example.com";
  let sarah = await prisma.user.findUnique({
    where: { email: sarahEmail },
  });

  if (!sarah) {
    sarah = await prisma.user.create({
      data: {
        id: "sarah-vip",
        email: sarahEmail,
        name: "Sarah",
        username: "Sarah",
        role: "CUSTOMER",
        phone: "+1 (555) 019-2831",
        membership: "VIP Curator",
        bio: "Interior designer passionate about harmonizing living spaces for athletic and sensitive companion pets.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      },
    });
    console.log(`✅ Seeded VIP customer user: ${sarahEmail}`);
  } else {
    console.log(`ℹ️ VIP customer user already exists: ${sarahEmail}`);
  }

  // 1.7 Seed Default Addresses for Sarah
  const existingAddressesCount = await prisma.address.count({
    where: { userId: sarah.id },
  });

  if (existingAddressesCount === 0) {
    await prisma.address.createMany({
      data: [
        {
          id: "addr-1",
          label: "Primary Studio",
          street: "1240 Park Avenue, Apt 4B",
          city: "New York",
          state: "NY",
          zip: "10128",
          country: "United States",
          isDefault: true,
          userId: sarah.id,
        },
        {
          id: "addr-2",
          label: "Summer Cottage",
          street: "82 Ocean Breeze Lane",
          city: "East Hampton",
          state: "NY",
          zip: "11937",
          country: "United States",
          isDefault: false,
          userId: sarah.id,
        },
      ],
    });
    console.log("✅ Seeded default addresses for Sarah.");
  } else {
    console.log(`ℹ️ Default addresses already exist for Sarah.`);
  }

  // 2. Seed Mock Products
  let seededProductsCount = 0;
  for (const p of MOCK_PRODUCTS) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: p.id },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          image: p.image,
          category: p.category,
          secondaryImages: p.secondaryImages || [],
          sizes: p.sizes || [],
          colors: p.colors || [],
          tags: p.tags || [],
          brand: p.brand,
          inStock: p.inStock ?? true,
        },
      });
      seededProductsCount++;
    }
  }
  if (seededProductsCount > 0) {
    console.log(`✅ Seeded ${seededProductsCount} products.`);
  } else {
    console.log(`ℹ️ All mock products already exist in database.`);
  }

  // 3. Seed Default Partner Users & Stores
  const partnersData = [
    {
      email: "partner1@thepawsstore.com",
      name: "Default Partner 1",
      username: "partner1",
      password: "Partner@123",
      businessName: "Downtown Pet Supply",
      address: "123 Main St, Seattle, WA 98101",
      lat: 47.6062,
      lng: -122.3321,
      taxId: "TAX-123456"
    },
    {
      email: "partner2@thepawsstore.com",
      name: "Default Partner 2",
      username: "partner2",
      password: "Partner@123",
      businessName: "Eastside Dog Boutique",
      address: "456 Bellevue Way, Bellevue, WA 98004",
      lat: 47.6101,
      lng: -122.1420,
      taxId: "TAX-789012"
    },
    {
      email: "partner3@thepawsstore.com",
      name: "Default Partner 3",
      username: "partner3",
      password: "Partner@123",
      businessName: "Westside Cat Curators",
      address: "789 California Ave, West Seattle, WA 98116",
      lat: 47.5701,
      lng: -122.4020,
      taxId: "TAX-345678"
    }
  ];

  let firstStoreId = "";

  for (const pd of partnersData) {
    let pUser = await prisma.user.findUnique({
      where: { email: pd.email },
    });

    if (!pUser) {
      pUser = await prisma.user.create({
        data: {
          email: pd.email,
          name: pd.name,
          username: pd.username,
          password: pd.password,
          role: "PARTNER",
        },
      });
      console.log(`✅ Seeded partner user: ${pd.email}`);
    }

    let pStore = await prisma.partnerStore.findUnique({
      where: { ownerId: pUser.id },
    });

    if (!pStore) {
      pStore = await prisma.partnerStore.create({
        data: {
          businessName: pd.businessName,
          ownerId: pUser.id,
          address: pd.address,
          lat: pd.lat,
          lng: pd.lng,
          approvalStatus: "ACTIVE",
          taxId: pd.taxId,
        },
      });
      console.log(`✅ Seeded active partner store: "${pd.businessName}"`);
    }

    if (pd.email === "partner1@thepawsstore.com") {
      firstStoreId = pStore.id;
    }
  }

  // 4. Seed Partner Inventory (Conditionally)
  if (firstStoreId) {
    const existingInventoryCount = await prisma.partnerInventory.count({
      where: { storeId: firstStoreId },
    });

    if (existingInventoryCount === 0) {
      await prisma.partnerInventory.createMany({
        data: [
          { storeId: firstStoreId, name: "Premium Dog Chew Toys", price: 19.99 },
          { storeId: firstStoreId, name: "Luxury Memory Foam Cat Pillow", price: 49.00 },
        ],
      });
      console.log("✅ Seeded default partner store inventory.");
    } else {
      console.log(`ℹ️ Partner store inventory already contains ${existingInventoryCount} items. Skipping inventory seed.`);
    }
  }

  // 5. Seed Coupons
  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    await prisma.coupon.createMany({
      data: [
        { code: "ELEVATE10", percent: 10, isActive: true, maxUses: 100, usedCount: 15 },
        { code: "VIP20", percent: 20, isActive: true, maxUses: 50, usedCount: 12 },
        { code: "WELCOME5", percent: 5, isActive: true, maxUses: 200, usedCount: 4 }
      ]
    });
    console.log("✅ Seeded default coupons.");
  } else {
    console.log(`ℹ️ Coupons already exist.`);
  }

  // 6. Seed Pet Profiles
  const petProfileCount = await prisma.petProfile.count();
  if (petProfileCount === 0) {
    await prisma.petProfile.createMany({
      data: [
        {
          id: "pet-1",
          name: "Luna",
          type: "cat",
          breed: "Persian Royal Blue",
          age: "3 Years",
          weight: "9.2 lbs",
          image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
          bio: "Luna loves high-vantage lounges and slow continuous-flow ceramic water fountains.",
          recommendations: ["walnut-cat-hammock", "ceramic-cat-fountain"]
        }
      ]
    });
    console.log("✅ Seeded default pet profiles.");
  } else {
    console.log("ℹ️ Default pet profiles already exist.");
  }

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
