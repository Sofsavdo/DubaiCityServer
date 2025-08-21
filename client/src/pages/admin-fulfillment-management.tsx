/* Duplicate initial implementation commented out to avoid multiple default exports */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Truck,
  Store,
  Target,
  AlertCircle,
  Info,
  Calculator,
  FileText,
  Image,
  Settings,
  Bell
} from 'lucide-react';
import { Link, useParams } from 'wouter';

interface FulfillmentRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  productName: string;
  productDescription: string;
  productCategory: string;
  expectedQuantity: number;
  estimatedPrice: number;
  costPrice: number;
  supplierInfo: string;
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent';
  deliveryDate: string;
  specialRequirements?: string;
  productImages: string[];
  productDocuments?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_warehouse' | 'on_marketplace';
  createdAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

interface WarehouseItem {
  id: string;
  productName: string;
  partnerId: string;
  partnerName: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  location: string;
  status: 'active' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

interface MarketplaceProduct {
  id: string;
  productName: string;
  partnerId: string;
  partnerName: string;
  marketplace: string;
  storeName: string;
  price: number;
  stockQuantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  lastSync: string;
  salesCount: number;
  revenue: number;
}

export default function AdminFulfillmentManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FulfillmentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || (user as any).role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = user ? "/" : "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Mock data - in real app this would come from API
  const [fulfillmentRequests] = useState<FulfillmentRequest[]>([
    {
      id: '1',
      partnerId: '1',
      partnerName: 'Tech Solutions',
      productName: 'iPhone 15 Pro 256GB',
      productDescription: 'Apple iPhone 15 Pro 256GB, Titanium, A17 Pro chip',
      productCategory: 'Electronics',
      expectedQuantity: 50,
      estimatedPrice: 15000000,
      costPrice: 12000000,
      supplierInfo: 'Apple Authorized Reseller, +998901234567',
      urgencyLevel: 'high',
      deliveryDate: '2024-02-15',
      specialRequirements: 'Original packaging required',
      productImages: ['iphone1.jpg', 'iphone2.jpg'],
      status: 'pending',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      partnerId: '2',
      partnerName: 'Fashion Store',
      productName: 'Nike Air Max 270',
      productDescription: 'Nike Air Max 270 sneakers, size 42-45',
      productCategory: 'Sports',
      expectedQuantity: 100,
      estimatedPrice: 2500000,
      costPrice: 1800000,
      supplierInfo: 'Nike Official Store, +998901234568',
      urgencyLevel: 'normal',
      deliveryDate: '2024-02-20',
      productImages: ['nike1.jpg'],
      status: 'approved',
      createdAt: '2024-01-19',
      approvedAt: '2024-01-20'
    }
  ]);

  const [warehouseItems] = useState<WarehouseItem[]>([
    {
      id: '1',
      productName: 'iPhone 15 Pro 256GB',
      partnerId: '1',
      partnerName: 'Tech Solutions',
      quantity: 50,
      availableQuantity: 45,
      reservedQuantity: 5,
      location: 'A-1-2',
      status: 'active',
      lastUpdated: '2024-01-20'
    },
    {
      id: '2',
      productName: 'Nike Air Max 270',
      partnerId: '2',
      partnerName: 'Fashion Store',
      quantity: 100,
      availableQuantity: 80,
      reservedQuantity: 20,
      location: 'B-3-1',
      status: 'active',
      lastUpdated: '2024-01-19'
    }
  ]);

  const [marketplaceProducts] = useState<MarketplaceProduct[]>([
    {
      id: '1',
      productName: 'iPhone 15 Pro 256GB',
      partnerId: '1',
      partnerName: 'Tech Solutions',
      marketplace: 'Uzum Market',
      storeName: 'Tech Solutions Store',
      price: 15000000,
      stockQuantity: 45,
      status: 'active',
      lastSync: '2024-01-20 14:30',
      salesCount: 5,
      revenue: 75000000
    },
    {
      id: '2',
      productName: 'Nike Air Max 270',
      partnerId: '2',
      partnerName: 'Fashion Store',
      marketplace: 'Yandex Market',
      storeName: 'Fashion Store',
      price: 2500000,
      stockQuantity: 80,
      status: 'active',
      lastSync: '2024-01-20 13:45',
      salesCount: 20,
      revenue: 50000000
    }
  ]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      // API call would go here
      toast({
        title: "So'rov tasdiqlandi",
        description: "Mahsulot omborga qo'shildi",
      });
      // Refresh data
      queryClient.invalidateQueries(['fulfillment-requests']);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "So'rovni tasdiqlashda xatolik",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Xatolik",
        description: "Rad etish sababini kiriting",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      toast({
        title: "So'rov rad etildi",
        description: "Hamkor xabardor qilindi",
      });
      setRejectionReason('');
      setIsDetailDialogOpen(false);
      // Refresh data
      queryClient.invalidateQueries(['fulfillment-requests']);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "So'rovni rad etishda xatolik",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_warehouse': return 'bg-blue-100 text-blue-800';
      case 'on_marketplace': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" data-testid="link-back">
                <Button variant="ghost" size="sm" className="text-sm mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">MarketPlace Pro</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Admin - Fulfillment Boshqarish
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Bildirishnomalar
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-neutral-600">Online</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Kutilayotgan So'rovlar</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {fulfillmentRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Ko'rib chiqish kerak
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Ombordagi Mahsulotlar</CardTitle>
              <Warehouse className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{warehouseItems.length}</div>
              <div className="text-xs text-green-700 mt-1">
                Faol mahsulotlar
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Marketplace Mahsulotlar</CardTitle>
              <Store className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{marketplaceProducts.length}</div>
              <div className="text-xs text-purple-700 mt-1">
                Sotuvda
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Jami Savdo</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {formatCurrency(marketplaceProducts.reduce((sum, p) => sum + p.revenue, 0))}
              </div>
              <div className="text-xs text-orange-700 mt-1">
                Bu oy
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Fulfillment So'rovlar</TabsTrigger>
            <TabsTrigger value="warehouse">Ombor Boshqaruvi</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace Mahsulotlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitika</TabsTrigger>
          </TabsList>

          {/* Fulfillment Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Fulfillment So'rovlari</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Qidirish
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtr
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fulfillmentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{request.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {request.partnerName} • {request.expectedQuantity} dona • {formatCurrency(request.estimatedPrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'pending' ? 'Kutilmoqda' :
                           request.status === 'approved' ? 'Tasdiqlangan' :
                           request.status === 'rejected' ? 'Rad etilgan' :
                           request.status === 'in_warehouse' ? 'Omborda' : 'Marketplace\'da'}
                        </Badge>
                        <Badge className={getUrgencyColor(request.urgencyLevel)}>
                          {request.urgencyLevel === 'low' ? 'Past' :
                           request.urgencyLevel === 'normal' ? 'O\'rtacha' :
                           request.urgencyLevel === 'high' ? 'Yuqori' : 'Shoshilinch'}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Tasdiqlash
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsDetailDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rad etish
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warehouse Management Tab */}
          <TabsContent value="warehouse" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ombor Boshqaruvi</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi mahsulot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Warehouse className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {item.partnerName} • {item.location}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Jami: {item.quantity} | Mavjud: {item.availableQuantity} | Rezerv: {item.reservedQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'active' ? 'Faol' :
                           item.status === 'low_stock' ? 'Kam qoldiq' : 'Tugagan'}
                        </Badge>
                        <div className="w-24">
                          <Progress 
                            value={(item.availableQuantity / item.quantity) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Products Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Marketplace Mahsulotlar</CardTitle>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Sync qilish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketplaceProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{product.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {product.partnerName} • {product.marketplace} • {product.storeName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Oxirgi sync: {product.lastSync}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.price)}</div>
                          <div className="text-sm text-gray-600">{product.stockQuantity} dona</div>
                        </div>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status === 'active' ? 'Faol' :
                           product.status === 'inactive' ? 'Nofaol' : 'Tugagan'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{product.salesCount} sotuv</div>
                          <div className="text-xs text-gray-600">{formatCurrency(product.revenue)}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment statistikasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Tasdiqlangan so'rovlar</span>
                      <span className="font-medium text-green-600">
                        {fulfillmentRequests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rad etilgan so'rovlar</span>
                      <span className="font-medium text-red-600">
                        {fulfillmentRequests.filter(r => r.status === 'rejected').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">O'rtacha qayta ishlash vaqti</span>
                      <span className="font-medium text-blue-600">2.5 kun</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ombordagi jami qiymat</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(warehouseItems.reduce((sum, item) => sum + (item.quantity * 1000000), 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marketplace performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Jami sotuvlar</span>
                      <span className="font-medium text-green-600">
                        {marketplaceProducts.reduce((sum, p) => sum + p.salesCount, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Jami daromad</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(marketplaceProducts.reduce((sum, p) => sum + p.revenue, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">O'rtacha narx</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(marketplaceProducts.reduce((sum, p) => sum + p.price, 0) / marketplaceProducts.length)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Faol mahsulotlar</span>
                      <span className="font-medium text-orange-600">
                        {marketplaceProducts.filter(p => p.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fulfillment So'rovi Tafsilotlari</DialogTitle>
            <DialogDescription>
              Mahsulot ma'lumotlari va boshqarish
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mahsulot nomi</label>
                  <p className="text-sm text-gray-600">{selectedRequest.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hamkor</label>
                  <p className="text-sm text-gray-600">{selectedRequest.partnerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Miqdori</label>
                  <p className="text-sm text-gray-600">{selectedRequest.expectedQuantity} dona</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Narxi</label>
                  <p className="text-sm text-gray-600">{formatCurrency(selectedRequest.estimatedPrice)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tannarx</label>
                  <p className="text-sm text-gray-600">{formatCurrency(selectedRequest.costPrice)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Shoshilish</label>
                  <Badge className={getUrgencyColor(selectedRequest.urgencyLevel)}>
                    {selectedRequest.urgencyLevel === 'low' ? 'Past' :
                     selectedRequest.urgencyLevel === 'normal' ? 'O\'rtacha' :
                     selectedRequest.urgencyLevel === 'high' ? 'Yuqori' : 'Shoshilinch'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Mahsulot tavsifi</label>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.productDescription}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Yetkazib beruvchi</label>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.supplierInfo}</p>
              </div>

              {selectedRequest.specialRequirements && (
                <div>
                  <label className="text-sm font-medium">Maxsus talablar</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.specialRequirements}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Rad etish sababi (ixtiyoriy)</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rad etish sababini kiriting..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailDialogOpen(false)}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                    >
                      Rad etish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
