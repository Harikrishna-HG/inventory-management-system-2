const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all invoices
router.get("/", auth, async (req, res) => {
  try {
    const {
      customer,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      userId: req.user.id,
      ...(customer && customer !== "all" && { customerId: customer }),
      ...(status && status !== "all" && { status }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single invoice
router.get("/:id", auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create invoice
router.post("/", auth, async (req, res) => {
  try {
    const { customerId, items, taxAmount, discount, dueDate, notes } = req.body;

    // Validate input
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer and items are required" });
    }

    // Check if customer exists and belongs to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: req.user.id,
      },
    });

    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    // Validate products and calculate totals
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          id: item.productId,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!product) {
        return res
          .status(400)
          .json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        });
      }

      const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    // Add tax and subtract discount
    totalAmount += (taxAmount || 0) - (discount || 0);

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: req.user.id },
    });
    const invoiceNo = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

    // Create invoice with transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNo,
          customerId,
          totalAmount,
          taxAmount: taxAmount || 0,
          discount: discount || 0,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes: notes || null,
          userId: req.user.id,
        },
      });

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: validatedItems.map((item) => ({
          invoiceId: newInvoice.id,
          ...item,
        })),
      });

      // Update product stock quantities and create stock movements
      for (const item of validatedItems) {
        // Update stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reason: "Sale",
            reference: newInvoice.invoiceNo,
            userId: req.user.id,
          },
        });
      }

      return newInvoice;
    });

    // Fetch complete invoice with relations
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: completeInvoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update invoice status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["PENDING", "PAID", "CANCELLED", "OVERDUE"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Update invoice status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete invoice
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Only allow deletion of pending invoices
    if (invoice.status === "PAID") {
      return res.status(400).json({ error: "Cannot delete paid invoice" });
    }

    // Delete invoice with transaction (restore stock)
    await prisma.$transaction(async (tx) => {
      // Restore stock quantities
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            reason: "Invoice cancellation",
            reference: invoice.invoiceNo,
            userId: req.user.id,
          },
        });
      }

      // Delete invoice (items will be deleted via cascade)
      await tx.invoice.delete({
        where: { id: req.params.id },
      });
    });

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
