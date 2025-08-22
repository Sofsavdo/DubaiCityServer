import * as XLSX from 'xlsx';
import type { PartnerWithUser, Product, OrderWithDetails, ProductRequestWithDetails } from '../../../shared/schema';

export const exportPartnersToExcel = (partners: PartnerWithUser[]) => {
  const data = partners.map(partner => ({
    'ID': partner.id,
    'Ism': partner.user.firstName || '',
    'Email': partner.user.email,
    'Biznes Nomi': partner.businessName || '',
    'Tavsifi': partner.description || '',
    'Tarif': partner.pricingTier || 'basic',
    'Fiksatsiya (oy)': Number(partner.fixedPayment || 0).toLocaleString() + ' so\'m',
    'Komissiya (%)': partner.commissionRate + '%',
    'Jami Savdo': Number(partner.totalSales || 0).toLocaleString() + ' so\'m',
    'Oylik Savdo': Number(partner.monthlySales || 0).toLocaleString() + ' so\'m',
    'Jami Foyda': Number(partner.totalProfit || 0).toLocaleString() + ' so\'m',
    'Oylik Foyda': Number(partner.monthlyProfit || 0).toLocaleString() + ' so\'m',
    'Jami Bonus': Number(partner.totalBonus || 0).toLocaleString() + ' so\'m',
    'Oylik Bonus': Number(partner.monthlyBonus || 0).toLocaleString() + ' so\'m',
    'Yaratilgan Sana': partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('uz-UZ') : '',
    'Yangilangan': partner.updatedAt ? new Date(partner.updatedAt).toLocaleDateString('uz-UZ') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hamkorlar');
  
  XLSX.writeFile(workbook, `hamkorlar_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportInventoryToExcel = (products: Product[]) => {
  const data = products.map(product => ({
    'ID': product.id,
    'Mahsulot Nomi': product.name,
    'SKU': product.sku,
    'Sotuv Narxi': Number(product.price).toLocaleString() + ' so\'m',
    'Sebestoimost': Number(product.costPrice || 0).toLocaleString() + ' so\'m',
    'Zaxira Miqdori': product.stockQuantity || 0,
    'Yetkazilgan': product.deliveredQuantity || 0,
    'Sotilgan': product.soldQuantity || 0,
    'Qoldiq': (product.deliveredQuantity || 0) - (product.soldQuantity || 0),
    'Status': (product.stockQuantity || 0) <= 5 ? 'Kritik' : 
              (product.stockQuantity || 0) <= 10 ? 'Kam' : 'Yaxshi',
    'Tavsifi': product.description || '',
    'Yaratilgan': product.createdAt ? new Date(product.createdAt).toLocaleDateString('uz-UZ') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventar');
  
  XLSX.writeFile(workbook, `inventar_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportOrdersToExcel = (orders: OrderWithDetails[]) => {
  const data = orders.map(order => ({
    'Order ID': order.id,
    'Hamkor': order.partner.user.firstName || order.partner.user.email,
    'Mijoz': order.customerName,
    'Mahsulot': order.product.name,
    'Miqdor': order.quantity,
    'Jami Summa': order.totalAmount,
    'Status': order.status,
    'Buyurtma Sanasi': order.createdAt ? new Date(order.createdAt).toLocaleDateString('uz-UZ') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyurtmalar');
  
  XLSX.writeFile(workbook, `buyurtmalar_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportRequestsToExcel = (requests: ProductRequestWithDetails[]) => {
  const data = requests.map(request => ({
    'ID': request.id,
    'Hamkor': request.partner.user.firstName || request.partner.user.email,
    'Mahsulot Nomi': request.productName,
    'Taxminiy Narx': request.estimatedPrice || '',
    'Kutilayotgan Miqdor': request.expectedQuantity || '',
    'Status': request.status === 'pending' ? 'Kutilmoqda' : 
              request.status === 'approved' ? 'Tasdiqlandi' : 'Rad etildi',
    'Muhimlik Darajasi': request.urgencyLevel || 'Normal',
    'Tavsifi': request.description || '',
    'Yetkazib Beruvchi': request.supplierInfo || '',
    'So\'rov Sanasi': request.createdAt ? new Date(request.createdAt).toLocaleDateString('uz-UZ') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mahsulot Sorovlari');
  
  XLSX.writeFile(workbook, `sorovlar_${new Date().toISOString().split('T')[0]}.xlsx`);
};