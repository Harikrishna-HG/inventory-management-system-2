const express = require("express");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

// Get dashboard statistics
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic counts
    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalInvoices,
      products,
      recentInvoices,
    ] = await Promise.all([
      prisma.product.count({ where: { userId, isActive: true } }),
      prisma.category.count({ where: { userId } }),
      prisma.customer.count({ where: { userId, isActive: true } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.product.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          lowStockThreshold: true,
          price: true,
          category: {
            select: { name: true },
          },
        },
      }),
      prisma.invoice.findMany({
        where: { userId },
        select: {
          id: true,
          invoiceNo: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Calculate inventory statistics
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + product.price * product.stockQuantity,
      0
    );

    const lowStockProducts = products.filter(
      (product) => product.stockQuantity <= product.lowStockThreshold
    );

    const totalStockQuantity = products.reduce(
      (sum, product) => sum + product.stockQuantity,
      0
    );

    // Calculate sales statistics
    const totalSales = await prisma.invoice.aggregate({
      where: { userId },
      _sum: { totalAmount: true },
    });

    const pendingInvoices = await prisma.invoice.count({
      where: { userId, status: "PENDING" },
    });

    const paidInvoices = await prisma.invoice.count({
      where: { userId, status: "PAID" },
    });

    // Get monthly sales data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await prisma.invoice.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Process monthly sales data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthSales = monthlySales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() === date.getMonth() &&
          saleDate.getFullYear() === year
        );
      });

      monthlyData.push({
        month: `${month} ${year}`,
        sales: monthSales.reduce(
          (sum, sale) => sum + (sale._sum.totalAmount || 0),
          0
        ),
        invoices: monthSales.reduce((sum, sale) => sum + sale._count.id, 0),
      });
    }

    const stats = {
      totalProducts,
      totalCategories,
      totalCustomers,
      totalInvoices,
      totalInventoryValue,
      totalStockQuantity,
      lowStockProducts: lowStockProducts.length,
      totalSales: totalSales._sum.totalAmount || 0,
      pendingInvoices,
      paidInvoices,
      lowStockItems: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        currentStock: product.stockQuantity,
        threshold: product.lowStockThreshold,
        category: product.category.name,
      })),
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        customer: invoice.customer.name,
        amount: invoice.totalAmount,
        status: invoice.status,
        date: invoice.createdAt,
      })),
      monthlySales: monthlyData,
    };

    res.json({ stats });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
