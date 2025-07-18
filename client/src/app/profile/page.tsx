'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Building2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Edit3,
    Save,
    X,
    Monitor,
    Smartphone,
    Cpu,
    HardDrive
} from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        businessName: user?.businessName || '',
        ownerName: user?.ownerName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.address || '',
    });

    const handleSave = () => {
        // In a real app, you would update the user data here
        console.log('Saving profile data:', formData);
        setIsEditing(false);
        // You could call an API to update the user profile
    };

    const handleCancel = () => {
        setFormData({
            businessName: user?.businessName || '',
            ownerName: user?.ownerName || '',
            phone: user?.phone || '',
            email: user?.email || '',
            address: user?.address || '',
        });
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">No user data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6  mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <Monitor className="h-8 w-8 text-blue-600" />
                        <Smartphone className="h-8 w-8 text-green-600" />
                        <Cpu className="h-8 w-8 text-purple-600" />
                        <HardDrive className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
                        <p className="text-gray-600">Manage your business information</p>
                    </div>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Business Information
                            </CardTitle>
                            <CardDescription>
                                Details about your computer and electronics business
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Business Name</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            placeholder="Enter business name"
                                        />
                                    ) : (
                                        <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{user.businessName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Owner Name</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            placeholder="Enter owner name"
                                        />
                                    ) : (
                                        <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{user.ownerName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Address</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Enter business address"
                                    />
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{user.address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>
                                How customers and suppliers can reach you
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email address"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 bg-gray-50 p-2 rounded-md">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    {isEditing ? (
                                        <Input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 bg-gray-50 p-2 rounded-md">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            {user.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Business Stats & Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Business Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary" className="text-sm">
                                Computer & Electronics
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2">
                                Specialized inventory management for technology businesses in Nepal
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Account Created</span>
                                <span className="text-sm font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Account Status</span>
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">User ID</span>
                                <span className="text-xs font-mono text-gray-500">{user.id.slice(0, 8)}...</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Business Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                <div>
                                    <p className="text-sm font-medium">{user.address}</p>
                                    <p className="text-xs text-gray-500 mt-1">Nepal</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Business Features */}
            <Card>
                <CardHeader>
                    <CardTitle>TechInventory Pro Features</CardTitle>
                    <CardDescription>
                        Features available for your computer and electronics business
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <Monitor className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="font-medium text-sm">Computers</p>
                                <p className="text-xs text-gray-600">Laptops & Desktops</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <Smartphone className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">Mobile Devices</p>
                                <p className="text-xs text-gray-600">Phones & Tablets</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <Cpu className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="font-medium text-sm">Components</p>
                                <p className="text-xs text-gray-600">RAM, SSD, GPU</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <HardDrive className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="font-medium text-sm">Storage</p>
                                <p className="text-xs text-gray-600">HDDs & SSDs</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
