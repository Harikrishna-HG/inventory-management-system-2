import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency, formatDate } from './utils';

// PDF Report Generation
export const generateInvoicePDF = (invoice: any) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Invoice Details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 20, 50);
  if (invoice.dueDate) {
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 20, 60);
  }
  
  // Customer Details
  doc.text('Bill To:', 20, 80);
  doc.text(invoice.customerName, 20, 90);
  if (invoice.customerPhone) {
    doc.text(`Phone: ${invoice.customerPhone}`, 20, 100);
  }
  if (invoice.customerAddress) {
    doc.text(invoice.customerAddress, 20, 110);
  }
  
  // Invoice Items Table
  const tableData = invoice.invoiceItems.map((item: any) => [
    item.productName,
    item.productSku || '-',
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discount > 0 ? formatCurrency(item.discount) : '-',
    formatCurrency(item.totalPrice)
  ]);
  
  autoTable(doc, {
    head: [['Product', 'SKU', 'Qty', 'Unit Price', 'Discount', 'Total']],
    body: tableData,
    startY: 130,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 120, finalY);
  doc.text(`Tax: ${formatCurrency(invoice.taxAmount)}`, 120, finalY + 10);
  doc.text(`Discount: ${formatCurrency(invoice.discountAmount)}`, 120, finalY + 20);
  doc.setFontSize(14);
  doc.text(`Total: ${formatCurrency(invoice.totalAmount)}`, 120, finalY + 35);
  
  // Payment Status
  doc.setFontSize(12);
  doc.text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 20, finalY + 35);
  doc.text(`Paid: ${formatCurrency(invoice.paidAmount)}`, 20, finalY + 45);
  doc.text(`Balance: ${formatCurrency(invoice.balanceAmount)}`, 20, finalY + 55);
  
  return doc;
};

export const generateSalesReportPDF = (data: any) => {
  console.log('Generating sales report PDF with data:', data);
  
  if (!data) {
    throw new Error('No data provided for sales report');
  }
  
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Sales Report', 105, 20, { align: 'center' });
  
  // Summary
  doc.setFontSize(12);
  doc.text(`Total Sales: ${formatCurrency(data.totalSales || 0)}`, 20, 40);
  doc.text(`Total Invoices: ${data.totalInvoices || 0}`, 20, 50);
  doc.text(`Average Order Value: ${formatCurrency(data.averageOrderValue || 0)}`, 20, 60);
  doc.text(`Total Tax: ${formatCurrency(data.totalTax || 0)}`, 20, 70);
  
  // Invoices Table
  if (data.invoices && data.invoices.length > 0) {
    const tableData = data.invoices.map((invoice: any) => [
      invoice.invoiceNumber || '',
      formatDate(invoice.createdAt),
      invoice.customerName || '',
      formatCurrency(invoice.totalAmount || 0),
      invoice.paymentStatus || 'unknown'
    ]);
    
    autoTable(doc, {
      head: [['Invoice #', 'Date', 'Customer', 'Amount', 'Status']],
      body: tableData,
      startY: 90,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
  } else {
    doc.text('No invoices found for the selected period.', 20, 90);
  }
  
  return doc;
};

export const generateInventoryReportPDF = (products: any[], categories: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Inventory Report', 105, 20, { align: 'center' });
  
  // Summary
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;
  
  doc.setFontSize(12);
  doc.text(`Total Products: ${totalProducts}`, 20, 40);
  doc.text(`Total Inventory Value: ${formatCurrency(totalValue)}`, 20, 50);
  doc.text(`Low Stock Items: ${lowStockItems}`, 20, 60);
  
  // Products Table
  const tableData = products.map((product: any) => [
    product.name,
    product.sku,
    product.stockQuantity.toString(),
    product.lowStockThreshold.toString(),
    formatCurrency(product.price),
    formatCurrency(product.price * product.stockQuantity)
  ]);
  
  autoTable(doc, {
    head: [['Product', 'SKU', 'Stock', 'Min Stock', 'Unit Price', 'Total Value']],
    body: tableData,
    startY: 80,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  return doc;
};

// Excel Report Generation
export const generateSalesReportExcel = (data: any) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Sales', data.totalSales],
    ['Total Invoices', data.totalInvoices],
    ['Average Order Value', data.averageOrderValue],
    ['Total Tax', data.totalTax],
    ['Total Discount', data.totalDiscount]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Invoices Sheet
  const invoicesData = [
    ['Invoice Number', 'Date', 'Customer', 'Phone', 'Subtotal', 'Tax', 'Discount', 'Total', 'Paid', 'Balance', 'Status']
  ];
  
  data.invoices.forEach((invoice: any) => {
    invoicesData.push([
      invoice.invoiceNumber,
      invoice.createdAt,
      invoice.customerName,
      invoice.customerPhone || '',
      invoice.subtotal,
      invoice.taxAmount,
      invoice.discountAmount,
      invoice.totalAmount,
      invoice.paidAmount,
      invoice.balanceAmount,
      invoice.paymentStatus
    ]);
  });
  
  const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
  XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Invoices');
  
  return workbook;
};

export const generateInventoryReportExcel = (products: any[], categories: any[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Products Sheet
  const productsData = [
    ['Name', 'SKU', 'Category', 'Stock Quantity', 'Low Stock Threshold', 'Unit Price', 'Cost Price', 'Total Value', 'Supplier', 'Created Date', 'Status']
  ];
  
  products.forEach((product: any) => {
    const category = categories.find(c => c.id === product.categoryId);
    productsData.push([
      product.name,
      product.sku,
      category?.name || 'Unknown',
      product.stockQuantity,
      product.lowStockThreshold,
      product.price,
      product.costPrice,
      product.price * product.stockQuantity,
      product.supplier,
      product.createdAt,
      product.isActive ? 'Active' : 'Inactive'
    ]);
  });
  
  const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
  
  // Categories Sheet
  const categoriesData = [
    ['Name', 'Description', 'Color', 'Product Count', 'Created Date']
  ];
  
  categories.forEach((category: any) => {
    const productCount = products.filter(p => p.categoryId === category.id).length;
    categoriesData.push([
      category.name,
      category.description,
      category.color,
      productCount,
      category.createdAt
    ]);
  });
  
  const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');
  
  return workbook;
};

// Download functions
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, filename);
};

export const downloadCSV = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

// Print functions
export const printInvoice = (invoice: any) => {
  const doc = generateInvoicePDF(invoice);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

export const printReport = (doc: jsPDF) => {
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

// Generic Report Generation Functions
export const generatePDFReport = async (reportData: any, reportType: string): Promise<string> => {
  const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  switch (reportType) {
    case 'sales':
      // Pass the analytics data directly to the PDF generator
      const salesPDF = generateSalesReportPDF(reportData.analytics);
      downloadPDF(salesPDF, filename);
      break;
    case 'inventory':
      const inventoryPDF = generateInventoryReportPDF(reportData.products || [], reportData.categories || []);
      downloadPDF(inventoryPDF, filename);
      break;
    case 'profit_loss':
    case 'tax':
    case 'customer':
      // For now, use sales report format for these types
      const genericPDF = generateSalesReportPDF(reportData.analytics);
      downloadPDF(genericPDF, filename);
      break;
    default:
      throw new Error('Unsupported report type');
  }
  
  return filename;
};

export const generateExcelReport = async (reportData: any, reportType: string): Promise<string> => {
  const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  switch (reportType) {
    case 'sales':
      const salesWorkbook = generateSalesReportExcel(reportData.analytics);
      downloadExcel(salesWorkbook, filename);
      break;
    case 'inventory':
      const inventoryWorkbook = generateInventoryReportExcel(reportData.products || [], reportData.categories || []);
      downloadExcel(inventoryWorkbook, filename);
      break;
    case 'profit_loss':
    case 'tax':
    case 'customer':
      // For now, use sales report format for these types
      const genericWorkbook = generateSalesReportExcel(reportData.analytics);
      downloadExcel(genericWorkbook, filename);
      break;
    default:
      throw new Error('Unsupported report type');
  }
  
  return filename;
};

export const generateCSVReport = async (reportData: any, reportType: string): Promise<string> => {
  const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Convert analytics data to CSV format
  const csvData = [
    ['Metric', 'Value'],
    ['Total Sales', formatCurrency(reportData.analytics?.totalSales || 0)],
    ['Total Invoices', (reportData.analytics?.totalInvoices || 0).toString()],
    ['Average Order Value', formatCurrency(reportData.analytics?.averageOrderValue || 0)],
    ['Total Tax', formatCurrency(reportData.analytics?.totalTax || 0)],
    ['Total Discount', formatCurrency(reportData.analytics?.totalDiscount || 0)],
  ];
  
  if (reportData.dateRange?.from) {
    csvData.push(['Date From', reportData.dateRange.from]);
  }
  if (reportData.dateRange?.to) {
    csvData.push(['Date To', reportData.dateRange.to]);
  }
  if (reportData.filters?.customer) {
    csvData.push(['Customer Filter', reportData.filters.customer]);
  }
  if (reportData.filters?.category) {
    csvData.push(['Category Filter', reportData.filters.category]);
  }
  
  downloadCSV(csvData, filename);
  return filename;
};
