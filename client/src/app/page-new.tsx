"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingDown, DollarSign, BarChart3, LogOut, Building, Users, BedDouble, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product, Category } from "@/types/inventory";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/auth-context";
import { sampleHotelRooms } from "@/lib/hotel-data";
import { useProducts, useCategories, useLowStockProducts } from "@/hooks/use-api";

export default function HotelDashboard() {
    const { user, signout } = useAuth();

    // Query hooks
    const { data: productsData, isLoading: productsLoading } = useProducts();
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const { data: lowStockData, isLoading: lowStockLoading } = useLowStockProducts();

    const products = productsData?.products || [];
    const categories = categoriesData?.categories || [];
    const lowStockProducts = lowStockData?.products || [];
    const isLoading = productsLoading || categoriesLoading || lowStockLoading;

    // Calculate stats from data
    const stats = {
        totalProducts: products.length,
        totalCategories: categories.length,
        lowStockProducts: lowStockProducts.length,
        totalInventoryValue: products.reduce((sum: number, product: Product) => sum + (product.price * product.stockQuantity), 0),
        totalStockQuantity: products.reduce((sum: number, product: Product) => sum + product.stockQuantity, 0),
        totalRooms: sampleHotelRooms.length,
        occupiedRooms: sampleHotelRooms.filter(room => room.status === 'occupied').length,
        availableRooms: sampleHotelRooms.filter(room => room.status === 'available').length,
        maintenanceRooms: sampleHotelRooms.filter(room => room.status === 'maintenance').length,
    };

    // Chart data for inventory by category
    const chartData = categories.map((category: Category) => {
        const categoryProducts = products.filter((p: Product) => p.categoryId === category.id);
        return {
            name: category.name,
            products: categoryProducts.length,
            value: categoryProducts.reduce((sum: number, p: Product) => sum + (p.price * p.stockQuantity), 0),
        };
    });

    const handleSignOut = async () => {
        await signout();
    };

    if (!user) {
        return <div>Please log in to access the dashboard.</div>;
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
                    <p className="text-gray-600">Overview of your hotel operations</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Inventory items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            Product categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Items need restocking
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Current stock value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Hotel Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRooms}</div>
                        <p className="text-xs text-muted-foreground">
                            Available rooms
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.occupiedRooms}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently occupied
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.availableRooms}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready for guests
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.maintenanceRooms}</div>
                        <p className="text-xs text-muted-foreground">
                            Under maintenance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Value by Category</CardTitle>
                        <CardDescription>Distribution of inventory value across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Low Stock Items</CardTitle>
                        <CardDescription>Items that need immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No low stock items</p>
                            ) : (
                                lowStockProducts.slice(0, 5).map((product: Product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="destructive">{product.stockQuantity} left</Badge>
                                            <p className="text-sm text-gray-600">Threshold: {product.lowStockThreshold}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
