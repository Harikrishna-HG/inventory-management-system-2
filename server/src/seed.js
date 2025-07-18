const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });

  console.log("👤 Created test user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        color: "#3B82F6",
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Clothing",
        description: "Apparel and accessories",
        color: "#10B981",
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Books",
        description: "Books and publications",
        color: "#F59E0B",
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Garden",
        description: "Home improvement and garden supplies",
        color: "#EF4444",
        userId: user.id,
      },
    }),
  ]);

  console.log("📂 Created categories:", categories.length);

  // Create products
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: "Laptop Dell XPS 13",
        description: "High-performance laptop for professionals",
        sku: "DELL-XPS-13-001",
        categoryId: categories[0].id,
        price: 899.99,
        costPrice: 650.0,
        stockQuantity: 25,
        lowStockThreshold: 5,
        supplier: "Dell Inc.",
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "iPhone 15 Pro",
        description: "Latest Apple smartphone",
        sku: "APPLE-IP15-PRO",
        categoryId: categories[0].id,
        price: 1199.99,
        costPrice: 800.0,
        stockQuantity: 15,
        lowStockThreshold: 3,
        supplier: "Apple Inc.",
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Samsung Galaxy Tab S9",
        description: "Android tablet with S Pen",
        sku: "SAMSUNG-TAB-S9",
        categoryId: categories[0].id,
        price: 649.99,
        costPrice: 450.0,
        stockQuantity: 8,
        lowStockThreshold: 5,
        supplier: "Samsung Electronics",
        userId: user.id,
      },
    }),

    // Clothing
    prisma.product.create({
      data: {
        name: "Nike Air Force 1",
        description: "Classic white sneakers",
        sku: "NIKE-AF1-WHITE",
        categoryId: categories[1].id,
        price: 129.99,
        costPrice: 70.0,
        stockQuantity: 50,
        lowStockThreshold: 10,
        supplier: "Nike Inc.",
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Levi's 501 Jeans",
        description: "Original fit blue jeans",
        sku: "LEVIS-501-BLUE",
        categoryId: categories[1].id,
        price: 89.99,
        costPrice: 45.0,
        stockQuantity: 75,
        lowStockThreshold: 15,
        supplier: "Levi Strauss & Co.",
        userId: user.id,
      },
    }),

    // Books
    prisma.product.create({
      data: {
        name: "The Great Gatsby",
        description: "Classic American novel by F. Scott Fitzgerald",
        sku: "BOOK-GATSBY-001",
        categoryId: categories[2].id,
        price: 12.99,
        costPrice: 6.0,
        stockQuantity: 100,
        lowStockThreshold: 20,
        supplier: "Penguin Random House",
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "JavaScript: The Good Parts",
        description: "Programming book by Douglas Crockford",
        sku: "BOOK-JS-GOOD",
        categoryId: categories[2].id,
        price: 29.99,
        costPrice: 15.0,
        stockQuantity: 35,
        lowStockThreshold: 8,
        supplier: "O'Reilly Media",
        userId: user.id,
      },
    }),

    // Home & Garden
    prisma.product.create({
      data: {
        name: "Dyson V15 Vacuum",
        description: "Cordless vacuum cleaner",
        sku: "DYSON-V15-001",
        categoryId: categories[3].id,
        price: 449.99,
        costPrice: 280.0,
        stockQuantity: 12,
        lowStockThreshold: 3,
        supplier: "Dyson Ltd.",
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Garden Hose 50ft",
        description: "Heavy-duty garden hose",
        sku: "HOSE-50FT-001",
        categoryId: categories[3].id,
        price: 39.99,
        costPrice: 20.0,
        stockQuantity: 30,
        lowStockThreshold: 8,
        supplier: "Garden Supply Co.",
        userId: user.id,
      },
    }),
  ]);

  console.log("📦 Created products:", products.length);

  // Create initial stock movements
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: product.stockQuantity,
        reason: "Initial stock",
        userId: user.id,
      },
    });
  }

  console.log("📊 Created stock movements");

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0123",
        address: "123 Main St, Anytown, USA",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1-555-0456",
        address: "456 Oak Ave, Another City, USA",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        phone: "+1-555-0789",
        address: "789 Pine Rd, Somewhere, USA",
        userId: user.id,
      },
    }),
  ]);

  console.log("👥 Created customers:", customers.length);

  // Create sample invoices
  const invoices = await Promise.all([
    // Invoice 1
    prisma.invoice.create({
      data: {
        invoiceNo: "INV-0001",
        customerId: customers[0].id,
        totalAmount: 1329.98,
        taxAmount: 106.4,
        discount: 0,
        status: "PAID",
        userId: user.id,
        items: {
          create: [
            {
              productId: products[0].id, // Laptop
              quantity: 1,
              unitPrice: 899.99,
              discount: 0,
              total: 899.99,
            },
            {
              productId: products[3].id, // Nike shoes
              quantity: 1,
              unitPrice: 129.99,
              discount: 0,
              total: 129.99,
            },
            {
              productId: products[5].id, // Book
              quantity: 2,
              unitPrice: 12.99,
              discount: 0,
              total: 25.98,
            },
          ],
        },
      },
    }),

    // Invoice 2
    prisma.invoice.create({
      data: {
        invoiceNo: "INV-0002",
        customerId: customers[1].id,
        totalAmount: 1849.98,
        taxAmount: 148.0,
        discount: 50.0,
        status: "PENDING",
        userId: user.id,
        items: {
          create: [
            {
              productId: products[1].id, // iPhone
              quantity: 1,
              unitPrice: 1199.99,
              discount: 0,
              total: 1199.99,
            },
            {
              productId: products[2].id, // Samsung tablet
              quantity: 1,
              unitPrice: 649.99,
              discount: 0,
              total: 649.99,
            },
          ],
        },
      },
    }),
  ]);

  console.log("🧾 Created invoices:", invoices.length);

  // Update product stock after invoice creation
  await prisma.product.update({
    where: { id: products[0].id },
    data: { stockQuantity: { decrement: 1 } },
  });

  await prisma.product.update({
    where: { id: products[3].id },
    data: { stockQuantity: { decrement: 1 } },
  });

  await prisma.product.update({
    where: { id: products[5].id },
    data: { stockQuantity: { decrement: 2 } },
  });

  await prisma.product.update({
    where: { id: products[1].id },
    data: { stockQuantity: { decrement: 1 } },
  });

  await prisma.product.update({
    where: { id: products[2].id },
    data: { stockQuantity: { decrement: 1 } },
  });

  console.log("✅ Database seeded successfully!");
  console.log("📧 Test user email: test@example.com");
  console.log("🔑 Test user password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
