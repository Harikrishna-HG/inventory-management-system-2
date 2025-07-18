"use client";

import { TrendingDown, AlertTriangle, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Product } from "@/types/inventory";
import { useAuth } from "@/contexts/auth-context";
import { useLowStockProducts } from "@/hooks/use-api";

export default function LowStockPage() {
    const { user } = useAuth();
    const { data: lowStockData, isLoading, refetch } = useLowStockProducts();
    const lowStockItems = lowStockData?.products || [];

    const handleRefresh = () => {
        refetch();
    };

    if (!user) {
        return <div>Please log in to view low stock items.</div>;
    }

    // Calculate critical and high priority items
    const criticalItems = lowStockItems.filter((item: Product) => item.stockQuantity === 0);
    const highPriorityItems = lowStockItems.filter((item: Product) =>
        item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold / 2
    );

    const totalValue = lowStockItems.reduce((sum: number, item: Product) => {
        return sum + (item.price * item.stockQuantity);
    }, 0);

    const getStockLevel = (product: Product) => {
        if (product.stockQuantity === 0) {
            return { level: "Critical", color: "destructive" as const };
        } else if (product.stockQuantity <= product.lowStockThreshold / 2) {
            return { level: "High Priority", color: "destructive" as const };
        } else {
            return { level: "Low Stock", color: "warning" as const };
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Low Stock Alert</h1>
                    <p className="text-gray-600">Monitor items that need immediate attention</p>
                </div>
                <Button onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Out of stock items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{highPriorityItems.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Very low stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockItems.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Need restocking
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Low Stock Items ({lowStockItems.length})
                    </CardTitle>
                    <CardDescription>
                        Items that have reached or fallen below their low stock threshold
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading low stock items...</div>
                    ) : lowStockItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No low stock items found!</p>
                            <p className="text-sm">All items are well stocked.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total Value</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.map((product: Product) => {
                                    const stockLevel = getStockLevel(product);
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>
                                                <span className={`font-medium ${product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {product.stockQuantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>{product.lowStockThreshold}</TableCell>
                                            <TableCell>
                                                <Badge variant={stockLevel.color}>
                                                    {stockLevel.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(product.price)}</TableCell>
                                            <TableCell>{formatCurrency(product.price * product.stockQuantity)}</TableCell>
                                            <TableCell>{formatDate(product.updatedAt)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            {lowStockItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Items Affected</p>
                                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Value at Risk</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
