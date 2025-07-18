const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all categories
router.get("/", auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            stockQuantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single category
router.get("/:id", auth, async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            stockQuantity: true,
            price: true,
            lowStockThreshold: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create category
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Validate input
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    // Check if category with same name exists for user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: req.user.id,
      },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ error: "Category with this name already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || "#3B82F6",
        userId: req.user.id,
      },
      include: {
        products: true,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update category
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== existingCategory.name) {
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          name,
          userId: req.user.id,
          id: { not: req.params.id },
        },
      });

      if (conflictingCategory) {
        return res
          .status(400)
          .json({ error: "Category with this name already exists" });
      }
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(color && { color }),
      },
      include: {
        products: true,
      },
    });

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete category
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category has products
    if (category.products.length > 0) {
      return res.status(400).json({
        error: "Cannot delete category with associated products",
        productCount: category.products.length,
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
