const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all products
router.get("/", auth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: req.user.id,
      isActive: true,
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product
router.get("/:id", auth, async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create product
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      categoryId,
      price,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      supplier,
    } = req.body;

    // Validate input
    if (
      !name ||
      !description ||
      !sku ||
      !categoryId ||
      price === undefined ||
      costPrice === undefined ||
      stockQuantity === undefined
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Product with this SKU already exists" });
    }

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.user.id,
      },
    });

    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        categoryId,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        stockQuantity: parseInt(stockQuantity),
        lowStockThreshold: parseInt(lowStockThreshold) || 10,
        supplier: supplier || "",
        userId: req.user.id,
      },
      include: {
        category: true,
      },
    });

    // Create initial stock movement
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: parseInt(stockQuantity),
        reason: "Initial stock",
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      categoryId,
      price,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      supplier,
      isActive,
    } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if new SKU conflicts with existing product
    if (sku && sku !== existingProduct.sku) {
      const conflictingProduct = await prisma.product.findUnique({
        where: { sku },
      });

      if (conflictingProduct) {
        return res
          .status(400)
          .json({ error: "Product with this SKU already exists" });
      }
    }

    // Check if category exists and belongs to user (if updating category)
    if (categoryId && categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: req.user.id,
        },
      });

      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }
    }

    // Handle stock quantity changes
    if (
      stockQuantity !== undefined &&
      stockQuantity !== existingProduct.stockQuantity
    ) {
      const difference =
        parseInt(stockQuantity) - existingProduct.stockQuantity;

      // Create stock movement for the difference
      await prisma.stockMovement.create({
        data: {
          productId: req.params.id,
          type: difference > 0 ? "IN" : "OUT",
          quantity: Math.abs(difference),
          reason: "Stock adjustment",
          userId: req.user.id,
        },
      });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(sku && { sku }),
        ...(categoryId && { categoryId }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(stockQuantity !== undefined && {
          stockQuantity: parseInt(stockQuantity),
        }),
        ...(lowStockThreshold !== undefined && {
          lowStockThreshold: parseInt(lowStockThreshold),
        }),
        ...(supplier !== undefined && { supplier }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
      },
    });

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Soft delete - set isActive to false
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get low stock products
router.get("/low-stock/alert", auth, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        userId: req.user.id,
        isActive: true,
        stockQuantity: {
          lte: prisma.raw("low_stock_threshold"),
        },
      },
      include: {
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { stockQuantity: "asc" },
    });

    res.json({ products });
  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
