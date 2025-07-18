"use client";

import { useState } from "react";
import { Download, FileText, Filter, TrendingUp, BarChart3, Eye, Trash2, CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getDefaultCompanyInfo, ComprehensiveReportGenerator, ExcelReportGenerator } from "@/lib/comprehensive-report-generator";
import { useProducts, useCategories } from "@/hooks/use-api";
import { Category, Report } from "@/types/inventory";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
    const { user } = useAuth();
    const { data: productsData } = useProducts();
    const { data: categoriesData } = useCategories();

    const products = productsData?.products || [];
    const categories = categoriesData?.categories || [];

    const [reports, setReports] = useState<Report[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const [reportParams, setReportParams] = useState({
        type: 'inventory' as 'inventory' | 'sales' | 'tax' | 'profit_loss' | 'customer',
        format: 'pdf' as 'pdf' | 'excel' | 'csv',
        dateFrom: '',
        dateTo: '',
        categoryId: 'all',
    });

    const handleGenerateReport = async () => {
        if (!user) {
            alert('Please log in to generate reports');
            return;
        }

        if (!reportParams.dateFrom || !reportParams.dateTo) {
            alert('Please select both start and end dates for the report');
            return;
        }

        setIsGenerating(true);

        try {
            console.log('🚀 Starting report generation with params:', reportParams);

            const companyInfo = getDefaultCompanyInfo();
            companyInfo.name = user.businessName || "Your Business";
            companyInfo.contact.email = user.email || "info@yourbusiness.com";

            // Filter products by date if needed (you can implement date filtering logic here)
            const filteredProducts = products.filter((p: any) => {
                // Add your date filtering logic here based on product creation/update dates
                return true; // For now, include all products
            });

            // Prepare report data
            const reportData = {
                products: filteredProducts.map((p: any) => ({
                    ...p,
                    price: p.price || 0,
                    stockQuantity: p.stockQuantity || 0,
                    lowStockThreshold: p.lowStockThreshold || 0,
                    costPrice: p.costPrice || 0
                })),
                categories: categories,
                summary: {
                    totalProducts: filteredProducts.length,
                    totalCategories: categories.length,
                    totalInventoryValue: filteredProducts.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.stockQuantity || 0)), 0),
                    totalCostValue: filteredProducts.reduce((sum: number, p: any) => sum + ((p.costPrice || 0) * (p.stockQuantity || 0)), 0),
                    lowStockItems: filteredProducts.filter((p: any) => (p.stockQuantity || 0) <= (p.lowStockThreshold || 0)).length,
                    outOfStockItems: filteredProducts.filter((p: any) => (p.stockQuantity || 0) === 0).length,
                    lastUpdated: new Date()
                },
                period: `${reportParams.dateFrom} to ${reportParams.dateTo}`,
                generatedBy: user.email || 'System',
                generatedAt: new Date().toISOString(),
                reportType: reportParams.type
            };

            // Generate report based on selected format
            if (reportParams.format === 'pdf') {
                console.log('📄 Generating PDF report...');
                const generator = new ComprehensiveReportGenerator(companyInfo);
                await generator.generateInventoryReport(reportData);
            } else if (reportParams.format === 'excel') {
                console.log('📊 Generating Excel report...');
                const excelGenerator = new ExcelReportGenerator(companyInfo);
                await excelGenerator.generateInventoryExcel(reportData);
            } else if (reportParams.format === 'csv') {
                console.log('📋 Generating CSV report...');
                const csvContent = generateCSV(reportData);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${reportParams.type}_report_${reportParams.dateFrom}_to_${reportParams.dateTo}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Add new report to the list
            const newReport: Report = {
                id: Date.now().toString(),
                name: `${reportParams.type.charAt(0).toUpperCase() + reportParams.type.slice(1)} Report (${reportParams.dateFrom} to ${reportParams.dateTo})`,
                type: reportParams.type,
                format: reportParams.format,
                parameters: JSON.stringify(reportParams),
                status: 'completed',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            };

            setReports(prev => [newReport, ...prev]);
            console.log('✅ Report generation completed successfully');

            // Show success message
            alert(`${reportParams.format.toUpperCase()} report generated and downloaded successfully!`);
        } catch (error) {
            console.error('❌ Error generating report:', error);
            alert('Failed to generate report. Please check the console for details and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateCSV = (data: any) => {
        const headers = ['Product Name', 'SKU', 'Category', 'Stock Quantity', 'Price', 'Total Value', 'Status'];
        const rows = data.products.map((product: any) => [
            `"${product.name}"`,
            `"${product.sku}"`,
            `"${categories.find((c: any) => c.id === product.categoryId)?.name || 'Unknown'}"`,
            product.stockQuantity,
            product.price,
            (product.price * product.stockQuantity).toFixed(2),
            product.stockQuantity <= product.lowStockThreshold ? 'Low Stock' : 'In Stock'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const handleDeleteReport = (reportId: string) => {
        setReports(prev => prev.filter(r => r.id !== reportId));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to access the reports dashboard.</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate inventory statistics
    const inventoryStats = {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalValue: products.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.stockQuantity || 0)), 0),
        lowStockItems: products.filter((p: any) => (p.stockQuantity || 0) <= (p.lowStockThreshold || 0)).length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
                        <p className="text-gray-600 mt-1">Generate and download business reports</p>
                    </div>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                            <FileText className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalValue)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                            <AlertCircle className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{inventoryStats.lowStockItems}</div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{inventoryStats.totalCategories}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Configuration Panel */}
                <Card className="border border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Generate Report
                        </CardTitle>
                        <CardDescription>Select date range and format to generate reports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Report Type</label>
                                <Select
                                    value={reportParams.type}
                                    onValueChange={(value: string) => setReportParams({ ...reportParams, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select report type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inventory">Inventory Report</SelectItem>
                                        <SelectItem value="sales">Sales Report</SelectItem>
                                        <SelectItem value="tax">Tax Report</SelectItem>
                                        <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                                        <SelectItem value="customer">Customer Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Output Format</label>
                                <Select
                                    value={reportParams.format}
                                    onValueChange={(value: string) => setReportParams({ ...reportParams, format: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF Document</SelectItem>
                                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                        <SelectItem value="csv">CSV File</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Category Filter</label>
                                <Select
                                    value={reportParams.categoryId}
                                    onValueChange={(value: string) => setReportParams({ ...reportParams, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category: Category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Start Date *</label>
                                <Input
                                    type="date"
                                    value={reportParams.dateFrom}
                                    onChange={(e) => setReportParams({ ...reportParams, dateFrom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">End Date *</label>
                                <Input
                                    type="date"
                                    value={reportParams.dateTo}
                                    onChange={(e) => setReportParams({ ...reportParams, dateTo: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isGenerating || !reportParams.dateFrom || !reportParams.dateTo}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate & Download Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Generated Reports History */}
                <Card className="border border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Report History
                        </CardTitle>
                        <CardDescription>Previously generated reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reports.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
                                <p className="text-gray-500">Generate your first report to see it here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-gray-100 rounded">
                                                {report.format === 'pdf' && <FileText className="h-5 w-5 text-gray-600" />}
                                                {report.format === 'excel' && <BarChart3 className="h-5 w-5 text-gray-600" />}
                                                {report.format === 'csv' && <FileText className="h-5 w-5 text-gray-600" />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{report.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {report.type.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(report.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                                {report.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {report.status === 'generating' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                                                {report.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
