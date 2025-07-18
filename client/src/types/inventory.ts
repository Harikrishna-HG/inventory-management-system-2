// Hotel-specific inventory types
export type HotelInventoryType = 
  | 'room' 
  | 'housekeeping' 
  | 'food_beverage' 
  | 'amenities' 
  | 'maintenance' 
  | 'laundry' 
  | 'office_supplies' 
  | 'guest_supplies';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Hotel-specific fields
  hotelInventoryType: HotelInventoryType;
  unit: string; // e.g., 'piece', 'bottle', 'kg', 'liter', 'set'
  brand?: string;
  expiryDate?: string; // Important for F&B items
  batchNumber?: string;
  location: string; // Storage location (floor, room, warehouse)
  isPerishable: boolean;
  minimumOrderQuantity?: number;
  maximumCapacity?: number; // For rooms or storage
}

// Room-specific interface for hotel rooms
export interface HotelRoom {
  id: string;
  roomNumber: string;
  roomType: string; // 'standard', 'deluxe', 'suite', 'presidential'
  floor: number;
  capacity: number; // Number of guests
  basePrice: number;
  seasonalPrices?: { season: string; price: number }[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order';
  amenities: string[]; // ['wifi', 'tv', 'minibar', 'balcony', 'sea_view']
  lastCleaned?: string;
  nextMaintenance?: string;
  occupancy?: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  // Hotel-specific fields
  hotelInventoryType: HotelInventoryType;
  departmentResponsible: string; // 'housekeeping', 'food_service', 'maintenance', 'front_desk'
  storageLocation?: string;
  restockFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'consumption' | 'waste' | 'transfer';
  quantity: number;
  reason: string;
  referenceNumber?: string;
  createdAt: string;
  // Hotel-specific fields
  departmentUsed?: string; // Which department used the item
  roomNumber?: string; // If used for specific room
  guestId?: string; // If consumed by guest
  staffId?: string; // Staff member who processed the movement
  shiftTime?: 'morning' | 'afternoon' | 'night';
  costCenter?: string; // For accounting purposes
}

export interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  category: string;
  // Hotel-specific fields
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  estimatedRunoutDate?: string;
  lastOrderDate?: string;
  supplierContactInfo?: string;
}

// Hotel-specific dashboard stats
export interface HotelDashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  totalInventoryValue: number;
  totalStockQuantity: number;
  // Hotel-specific stats
  roomOccupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  perishableItemsExpiringSoon: number;
  dailyConsumptionValue: number;
  topConsumedItems: { name: string; quantity: number; department: string }[];
}

export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  supplier: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

// Billing and Invoice Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  panNumber?: string;
  vatNumber?: string;
  // Hotel-specific fields
  customerType?: 'guest' | 'corporate' | 'travel_agency' | 'regular';
  nationality?: string;
  passportNumber?: string;
  companyName?: string;
  loyaltyMembership?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  creditLimit?: number;
  paymentTerms?: string;
  totalStayNights?: number;
  totalSpent?: number;
  lastVisit?: string;
  preferences?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  invoiceItems: InvoiceItem[];
  customer?: Customer;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId?: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  product?: Product;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'profit_loss' | 'tax' | 'customer';
  format: 'pdf' | 'excel' | 'csv';
  parameters: string;
  filePath?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// Form Types for Billing
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  panNumber: string;
  vatNumber: string;
}

export interface InvoiceFormData {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  dueDate?: string;
  notes: string;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  productId?: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

// Report Generation Types
export interface ReportParams {
  type: 'sales' | 'inventory' | 'profit_loss' | 'tax' | 'customer';
  format: 'pdf' | 'excel' | 'csv';
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  categoryId?: string;
  includeInactive?: boolean;
}

// Additional Customer Types
export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  panNumber?: string;
  vatNumber?: string;
  userId: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  panNumber?: string;
  vatNumber?: string;
}

// Extended Customer interface with additional computed fields
export interface CustomerWithStats extends Customer {
  totalInvoices: number;
  totalSpent: number;
  notes?: string;
}

// Hotel Guest Management
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
  preferences?: string[];
  vipStatus?: 'regular' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  reservationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  depositPaid: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  specialRequests?: string;
  rateCode?: string;
  bookingSource: 'direct' | 'online' | 'travel_agent' | 'walk_in';
  createdAt: string;
  updatedAt: string;
  guest?: Guest;
  room?: HotelRoom;
}

// Housekeeping Management
export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  taskType: 'cleaning' | 'maintenance' | 'inspection' | 'setup';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string; // Staff member
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  notes?: string;
  itemsUsed?: { productId: string; quantity: number }[];
  createdAt: string;
  completedAt?: string;
  scheduledFor?: string;
}

export interface HousekeepingInventory {
  id: string;
  productId: string;
  roomNumber?: string;
  department: string;
  stockLevel: number;
  lastRestocked: string;
  consumptionRate: number; // per day
  autoRestockLevel: number;
  product?: Product;
}

// Food & Beverage Management
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  type: 'food' | 'beverage' | 'dessert' | 'appetizer';
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  costPrice: number;
  preparationTime: number; // in minutes
  allergens?: string[];
  dietaryInfo?: string[]; // 'vegetarian', 'vegan', 'gluten-free', etc.
  ingredients: { productId: string; quantity: number; unit: string }[];
  isAvailable: boolean;
  popularityScore: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategory;
}

export interface FoodBeverageOrder {
  id: string;
  orderNumber: string;
  guestId?: string;
  roomNumber?: string;
  orderType: 'room_service' | 'restaurant' | 'bar' | 'catering';
  items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderTime: string;
  deliveryTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance & Engineering
export interface MaintenanceRequest {
  id: string;
  roomNumber?: string;
  area: string; // 'guest_room', 'lobby', 'restaurant', 'pool', 'gym', etc.
  issueType: 'electrical' | 'plumbing' | 'hvac' | 'furniture' | 'appliance' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  description: string;
  reportedBy: string;
  assignedTo?: string;
  status: 'reported' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost?: number;
  actualCost?: number;
  partsUsed?: { productId: string; quantity: number }[];
  reportedAt: string;
  completedAt?: string;
  scheduledFor?: string;
}

// Hotel-specific dashboard and analytics
export interface HotelOperationalMetrics {
  date: string;
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  guestSatisfactionScore: number;
  housekeepingEfficiency: number; // average minutes per room
  maintenanceResponseTime: number; // average hours
  foodBeverageRevenue: number;
  inventoryTurnoverRate: number;
  totalGuests: number;
  checkIns: number;
  checkOuts: number;
  noShows: number;
  cancellations: number;
}

// Department-specific interfaces
export interface Department {
  id: string;
  name: string;
  description?: string;
  manager: string;
  budget: number;
  monthlyCosts: number;
  inventoryAllocated: string[]; // Product IDs
  staffCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  position: string;
  email?: string;
  phone?: string;
  shiftSchedule: string;
  accessLevel: 'basic' | 'supervisor' | 'manager' | 'admin';
  hireDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: Department;
}

// Extended form types for hotel operations
export interface HotelProductFormData extends ProductFormData {
  hotelInventoryType: HotelInventoryType;
  unit: string;
  brand?: string;
  expiryDate?: string;
  batchNumber?: string;
  location: string;
  isPerishable: boolean;
  minimumOrderQuantity?: number;
  maximumCapacity?: number;
}

export interface HotelCategoryFormData extends CategoryFormData {
  hotelInventoryType: HotelInventoryType;
  departmentResponsible: string;
  storageLocation?: string;
  restockFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface RoomFormData {
  roomNumber: string;
  roomType: string;
  floor: number;
  capacity: number;
  basePrice: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order';
}

export interface GuestFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  idNumber?: string;
  dateOfBirth?: string;
  address?: string;
  vipStatus?: 'regular' | 'silver' | 'gold' | 'platinum';
}

export interface ReservationFormData {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  rateCode?: string;
  bookingSource: 'direct' | 'online' | 'travel_agent' | 'walk_in';
}
