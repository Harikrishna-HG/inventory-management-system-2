"use client";

import { useState } from "react";
import { Plus, Minus, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/use-api";
import { Customer, InvoiceFormData, InvoiceItemFormData } from "@/types/inventory";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency } from "@/lib/utils";

export default function InvoiceCreation() {
    const { user } = useAuth();
    const { data: productsData } = useProducts();
    const products = productsData?.products || [];

    // Mock customers data since we don't have customer management yet
    const customers: Customer[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '098-765-4321',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        }
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState<InvoiceFormData>({
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        dueDate: "",
        notes: "",
        items: [
            {
                productId: "",
                productName: "",
                quantity: 1,
                unitPrice: 0,
                discount: 0
            }
        ]
    });

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    productId: "",
                    productName: "",
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0
                }
            ]
        }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: keyof InvoiceItemFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };

                    // If product is selected, update name and price
                    if (field === 'productId' && value) {
                        const product = products.find((p: any) => p.id === value);
                        if (product) {
                            updatedItem.productName = product.name;
                            updatedItem.unitPrice = product.price;
                        }
                    }

                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const updateCustomer = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setFormData(prev => ({
                ...prev,
                customerId,
                customerName: customer.name,
                customerPhone: customer.phone || "",
                customerAddress: "" // We don't have address in the customer model
            }));
        }
    };

    const calculateItemTotal = (item: InvoiceItemFormData) => {
        return (item.quantity * item.unitPrice) - item.discount;
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const invoiceData = {
                ...formData,
                subtotal: calculateSubtotal(),
                tax: calculateTax(),
                total: calculateTotal(),
                status: 'pending' as const,
                createdBy: user.email || 'system'
            };

            // Here you would typically send to your API
            console.log('Creating invoice:', invoiceData);

            // Reset form
            setFormData({
                customerId: "",
                customerName: "",
                customerPhone: "",
                customerAddress: "",
                dueDate: "",
                notes: "",
                items: [
                    {
                        productId: "",
                        productName: "",
                        quantity: 1,
                        unitPrice: 0,
                        discount: 0
                    }
                ]
            });

            setIsDialogOpen(true);
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div>Please log in to create invoices.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Create Invoice</h2>
                    <p className="text-gray-600">Generate invoices for your customers</p>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.customerId || formData.items.length === 0}
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Creating...' : 'Create Invoice'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>Select or enter customer details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer</label>
                            <Select
                                value={formData.customerId}
                                onValueChange={updateCustomer}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <Input
                                value={formData.customerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                value={formData.customerPhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Textarea
                                value={formData.customerAddress}
                                onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                                placeholder="Enter address"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Summary</CardTitle>
                        <CardDescription>Review invoice totals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%):</span>
                                <span>{formatCurrency(calculateTax())}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add any notes or special instructions"
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice Items
                    </CardTitle>
                    <CardDescription>Add products to the invoice</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Select
                                            value={item.productId}
                                            onValueChange={(value) => updateItem(index, 'productId', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product: any) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} - {formatCurrency(product.price)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            className="w-20"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                            className="w-24"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.discount}
                                            onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                            className="w-20"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(calculateItemTotal(item))}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                            disabled={formData.items.length === 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4">
                        <Button onClick={addItem} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Success Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invoice Created Successfully</DialogTitle>
                        <DialogDescription>
                            The invoice has been created and is ready for processing.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
