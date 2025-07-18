const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all customers
router.get("/", auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: req.user.id,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        include: {
          invoices: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    // Add calculated fields
    const customersWithStats = customers.map((customer) => ({
      ...customer,
      totalInvoices: customer.invoices.length,
      totalSpent: customer.invoices.reduce(
        (sum, invoice) => sum + invoice.totalAmount,
        0
      ),
      invoices: undefined, // Remove invoices from response
    }));

    res.json({
      customers: customersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single customer
router.get("/:id", auth, async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNo: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ customer });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create customer
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, address, notes, panNumber, vatNumber } =
      req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: "Customer name is required" });
    }

    // Check if customer with same email exists for user (if email provided)
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (existingCustomer) {
        return res
          .status(400)
          .json({ error: "Customer with this email already exists" });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        panNumber: panNumber || null,
        vatNumber: vatNumber || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update customer
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, address, notes, panNumber, vatNumber } =
      req.body;

    // Check if customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if new email conflicts with existing customer
    if (email && email !== existingCustomer.email) {
      const conflictingCustomer = await prisma.customer.findFirst({
        where: {
          email,
          userId: req.user.id,
          isActive: true,
          id: { not: req.params.id },
        },
      });

      if (conflictingCustomer) {
        return res
          .status(400)
          .json({ error: "Customer with this email already exists" });
      }
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(panNumber !== undefined && { panNumber: panNumber || null }),
        ...(vatNumber !== undefined && { vatNumber: vatNumber || null }),
      },
    });

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete customer
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if customer exists and belongs to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        invoices: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if customer has invoices
    if (customer.invoices.length > 0) {
      return res.status(400).json({
        error: "Cannot delete customer with associated invoices",
        invoiceCount: customer.invoices.length,
      });
    }

    // Soft delete - set isActive to false
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
