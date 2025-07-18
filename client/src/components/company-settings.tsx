"use client";

import { useState, useEffect } from "react";
import { Save, Building, Phone, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface CompanySettings {
    name: string;
    logo?: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
        fax?: string;
    };
    business: {
        registrationNumber?: string;
        taxId?: string;
        gstNumber?: string;
        industry: string;
        establishedYear?: number;
    };
    banking: {
        bankName?: string;
        accountNumber?: string;
        routingNumber?: string;
        swiftCode?: string;
    };
}

export default function CompanySettingsCard() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<CompanySettings>({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        },
        contact: {
            phone: '',
            email: '',
            website: '',
            fax: '',
        },
        business: {
            registrationNumber: '',
            taxId: '',
            gstNumber: '',
            industry: '',
            establishedYear: new Date().getFullYear(),
        },
        banking: {
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            swiftCode: '',
        },
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('companySettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading company settings:', error);
            }
        } else if (user) {
            // Set default values from user data
            setSettings(prev => ({
                ...prev,
                name: user.businessName || 'Your Company Name',
                contact: {
                    ...prev.contact,
                    email: user.email || '',
                    phone: user.phone || '',
                },
                address: {
                    ...prev.address,
                    street: user.address || '',
                }
            }));
        }
    }, [user]);

    const handleSave = () => {
        setIsSaving(true);
        try {
            localStorage.setItem('companySettings', JSON.stringify(settings));
            alert('Company settings saved successfully!');
        } catch (error) {
            console.error('Error saving company settings:', error);
            alert('Error saving company settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddressChange = (field: keyof CompanySettings['address'], value: string) => {
        setSettings(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    const handleContactChange = (field: keyof CompanySettings['contact'], value: string) => {
        setSettings(prev => ({
            ...prev,
            contact: {
                ...prev.contact,
                [field]: value,
            },
        }));
    };

    const handleBusinessChange = (field: keyof CompanySettings['business'], value: string | number) => {
        setSettings(prev => ({
            ...prev,
            business: {
                ...prev.business,
                [field]: value,
            },
        }));
    };

    const handleBankingChange = (field: keyof CompanySettings['banking'], value: string) => {
        setSettings(prev => ({
            ...prev,
            banking: {
                ...prev.banking,
                [field]: value,
            },
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Company Information</h2>
                    <p className="text-gray-600">Configure your company details for reports and invoices</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                    <CardDescription>
                        Company name and logo settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <Input
                            value={settings.name}
                            onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your company name"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                    </CardTitle>
                    <CardDescription>
                        Company address for invoices and reports
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Street Address</label>
                        <Input
                            value={settings.address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            placeholder="123 Business Street"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <Input
                                value={settings.address.city}
                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State/Province</label>
                            <Input
                                value={settings.address.state}
                                onChange={(e) => handleAddressChange('state', e.target.value)}
                                placeholder="State"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                            <Input
                                value={settings.address.zipCode}
                                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                placeholder="12345"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <Input
                                value={settings.address.country}
                                onChange={(e) => handleAddressChange('country', e.target.value)}
                                placeholder="Country"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                    </CardTitle>
                    <CardDescription>
                        Contact details for customers and partners
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                                value={settings.contact.phone}
                                onChange={(e) => handleContactChange('phone', e.target.value)}
                                placeholder="+1-234-567-8900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                                type="email"
                                value={settings.contact.email}
                                onChange={(e) => handleContactChange('email', e.target.value)}
                                placeholder="info@company.com"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Website</label>
                            <Input
                                value={settings.contact.website || ''}
                                onChange={(e) => handleContactChange('website', e.target.value)}
                                placeholder="www.company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fax (Optional)</label>
                            <Input
                                value={settings.contact.fax || ''}
                                onChange={(e) => handleContactChange('fax', e.target.value)}
                                placeholder="+1-234-567-8901"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Business Information
                    </CardTitle>
                    <CardDescription>
                        Legal and regulatory information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Industry</label>
                        <Input
                            value={settings.business.industry}
                            onChange={(e) => handleBusinessChange('industry', e.target.value)}
                            placeholder="e.g., Retail, Manufacturing, Services"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Registration Number</label>
                            <Input
                                value={settings.business.registrationNumber || ''}
                                onChange={(e) => handleBusinessChange('registrationNumber', e.target.value)}
                                placeholder="Business registration number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Established Year</label>
                            <Input
                                type="number"
                                value={settings.business.establishedYear?.toString() || ''}
                                onChange={(e) => handleBusinessChange('establishedYear', parseInt(e.target.value) || new Date().getFullYear())}
                                placeholder="2024"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tax ID</label>
                            <Input
                                value={settings.business.taxId || ''}
                                onChange={(e) => handleBusinessChange('taxId', e.target.value)}
                                placeholder="Tax identification number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">GST Number</label>
                            <Input
                                value={settings.business.gstNumber || ''}
                                onChange={(e) => handleBusinessChange('gstNumber', e.target.value)}
                                placeholder="GST registration number"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Banking Information
                    </CardTitle>
                    <CardDescription>
                        Bank details for invoices and payments (Optional)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Bank Name</label>
                        <Input
                            value={settings.banking.bankName || ''}
                            onChange={(e) => handleBankingChange('bankName', e.target.value)}
                            placeholder="Bank name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <Input
                                value={settings.banking.accountNumber || ''}
                                onChange={(e) => handleBankingChange('accountNumber', e.target.value)}
                                placeholder="Account number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Routing Number</label>
                            <Input
                                value={settings.banking.routingNumber || ''}
                                onChange={(e) => handleBankingChange('routingNumber', e.target.value)}
                                placeholder="Routing number"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">SWIFT Code (For International)</label>
                        <Input
                            value={settings.banking.swiftCode || ''}
                            onChange={(e) => handleBankingChange('swiftCode', e.target.value)}
                            placeholder="SWIFT/BIC code"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
