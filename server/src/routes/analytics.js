const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get analytics data
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateFrom, dateTo, category, customer } = req.query;

    // Build date filter
    const dateFilter = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    // Build where clause for invoices
    const invoiceWhere = {
      userId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      ...(customer && customer !== "all" && { customerId: customer }),
    };

    // Get invoice data
    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        customer: {
          select: { name: true },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate analytics
    const totalSales = invoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    const totalInvoices = invoices.length;
    const averageOrderValue =
      totalInvoices > 0 ? totalSales / totalInvoices : 0;
    const totalTax = invoices.reduce(
      (sum, invoice) => sum + invoice.taxAmount,
      0
    );
    const totalDiscount = invoices.reduce(
      (sum, invoice) => sum + invoice.discount,
      0
    );

    // Sales by status
    const salesByStatus = {
      PENDING: 0,
      PAID: 0,
      CANCELLED: 0,
      OVERDUE: 0,
    };

    invoices.forEach((invoice) => {
      salesByStatus[invoice.status] += invoice.totalAmount;
    });

    // Top products
    const productSales = {};
    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
            category: item.product.category.name,
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top customers
    const customerSales = {};
    invoices.forEach((invoice) => {
      const customerName = invoice.customer.name;
      if (!customerSales[customerName]) {
        customerSales[customerName] = {
          name: customerName,
          totalSpent: 0,
          invoiceCount: 0,
        };
      }
      customerSales[customerName].totalSpent += invoice.totalAmount;
      customerSales[customerName].invoiceCount += 1;
    });

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Category performance
    const categoryPerformance = {};
    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const categoryName = item.product.category.name;
        if (!categoryPerformance[categoryName]) {
          categoryPerformance[categoryName] = {
            name: categoryName,
            revenue: 0,
            quantity: 0,
          };
        }
        categoryPerformance[categoryName].revenue += item.total;
        categoryPerformance[categoryName].quantity += item.quantity;
      });
    });

    const categoryData = Object.values(categoryPerformance).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Daily sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await prisma.invoice.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Process daily sales
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const daySales = dailySales.filter((sale) => {
        const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
        return saleDate === dateString;
      });

      dailyData.push({
        date: dateString,
        sales: daySales.reduce(
          (sum, sale) => sum + (sale._sum.totalAmount || 0),
          0
        ),
        invoices: daySales.reduce((sum, sale) => sum + sale._count.id, 0),
      });
    }

    const analytics = {
      totalSales,
      totalInvoices,
      averageOrderValue,
      totalTax,
      totalDiscount,
      salesByStatus,
      topProducts,
      topCustomers,
      categoryPerformance: categoryData,
      dailySales: dailyData,
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
      filters: {
        category,
        customer,
      },
    };

    res.json({ analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
