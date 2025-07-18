"use client";

import { useState } from "react";
import { Settings, Save, X, Database, Shield, Bell, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/inventory";
import CompanySettingsCard from "@/components/company-settings";
import { useProducts, useCategories } from "@/hooks/use-api";

interface SystemSettings {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    timezone: string;
    language: string;
    lowStockThreshold: number;
    enableNotifications: boolean;
    enableAutoReorder: boolean;
    taxRate: number;
    fiscalYearStart: string;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { data: productsData } = useProducts();
    const { data: categoriesData } = useCategories();

    const products = productsData?.products || [];
    const categories = categoriesData?.categories || [];

    const [settings, setSettings] = useState<SystemSettings>({
        companyName: "TechInnovate Solutions",
        address: "123 Innovation Street, Tech City, TC 12345",
        phone: "+1 (555) 123-4567",
        email: "contact@techinnovate.com",
        currency: "USD",
        timezone: "America/New_York",
        language: "en",
        lowStockThreshold: 10,
        enableNotifications: true,
        enableAutoReorder: false,
        taxRate: 8.5,
        fiscalYearStart: "01-01",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Calculate system statistics
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalInventoryValue = products.reduce((sum: number, product: Product) =>
        sum + (product.price * product.stockQuantity), 0
    );
    const lowStockItems = products.filter((product: Product) =>
        product.stockQuantity <= product.lowStockThreshold
    ).length;

    const handleSave = async () => {
        try {
            // Here you would typically save to your API
            console.log('Saving settings:', settings);
            setIsEditing(false);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setHasUnsavedChanges(false);
        // Reset to original values
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);
    };

    if (!user) {
        return <div>Please log in to access settings.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-gray-600">Manage your system preferences and configuration</p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Edit Settings
                        </Button>
                    )}
                </div>
            </div>

            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCategories}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Company Settings */}
            <CompanySettingsCard />

            {/* System Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        System Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure system-wide settings and preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <Input
                                value={settings.currency}
                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                disabled={!isEditing}
                                placeholder="USD"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Timezone</label>
                            <Input
                                value={settings.timezone}
                                onChange={(e) => handleInputChange('timezone', e.target.value)}
                                disabled={!isEditing}
                                placeholder="America/New_York"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Default Low Stock Threshold</label>
                            <Input
                                type="number"
                                value={settings.lowStockThreshold}
                                onChange={(e) => handleInputChange('lowStockThreshold', Number(e.target.value))}
                                disabled={!isEditing}
                                placeholder="10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tax Rate (%)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={settings.taxRate}
                                onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                                disabled={!isEditing}
                                placeholder="8.5"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Settings
                    </CardTitle>
                    <CardDescription>
                        Manage how and when you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enable Notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts for low stock and other events</p>
                        </div>
                        <button
                            onClick={() => handleInputChange('enableNotifications', !settings.enableNotifications)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                } ${!isEditing ? 'opacity-50' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Auto Reorder</p>
                            <p className="text-sm text-gray-600">Automatically reorder products when they reach threshold</p>
                        </div>
                        <button
                            onClick={() => handleInputChange('enableAutoReorder', !settings.enableAutoReorder)}
                            disabled={!isEditing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableAutoReorder ? 'bg-blue-600' : 'bg-gray-200'
                                } ${!isEditing ? 'opacity-50' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAutoReorder ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                    </CardTitle>
                    <CardDescription>
                        Manage security and access control settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                            </div>
                            <Badge variant="secondary">Not Configured</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Session Timeout</p>
                                <p className="text-sm text-gray-600">Automatically log out after period of inactivity</p>
                            </div>
                            <Badge variant="secondary">30 minutes</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
