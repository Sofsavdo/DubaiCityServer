import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Shield, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  MessageCircle,
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Package,
  FileText,
  Bell
} from 'lucide-react';
import { getLowStockInventory, updatePartnerTier } from '@/lib/api';
import { exportInventoryToExcel } from '@/utils/excelExport';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProducts, 
  getPartners, 
  getPartnerRegistrationRequests,
  approvePartnerRegistration,
  rejectPartnerRegistration,
  createProduct
} from '@/lib/api';

interface AdminStats {
  totalPartners: number;
  totalProducts: number;
  monthlyRevenue: number;
  pendingRequests: number;
  activeOrders: number;
  systemHealth: number;
}

interface PartnerRequest {
  id: string;
  login: string;
  phone: string;
  address: string;
  productCategory: string;
  investmentAmount: number;
  productQuantity: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Partner {
  id: string;
  businessName: string;
  pricingTier: string;
  totalRevenue: number;
  monthlyRevenue: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  partnerId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
}

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Mock data - in real app this would come from API
  const [stats] = useState<AdminStats>({
    totalPartners: 24,
    totalProducts: 1234,
    monthlyRevenue: 45200000,
    pendingRequests: 7,
    activeOrders: 156,
    systemHealth: 98
  });

  const [partnerRequests] = useState<PartnerRequest[]>([
    { id: '1', login: 'aziz_tech', phone: '+998901234567', address: 'Toshkent shahri', productCategory: 'Electronics', investmentAmount: 5000000, productQuantity: 100, status: 'pending', createdAt: '2024-01-20' },
    { id: '2', login: 'malika_fashion', phone: '+998901234568', address: 'Samarqand viloyati', productCategory: 'Fashion', investmentAmount: 3000000, productQuantity: 50, status: 'pending', createdAt: '2024-01-19' },
    { id: '3', login: 'sardor_sports', phone: '+998901234569', address: 'Buxoro viloyati', productCategory: 'Sports', investmentAmount: 2000000, productQuantity: 75, status: 'pending', createdAt: '2024-01-18' },
  ]);

  const [partners, setPartners] = useState<Partner[]>([
    { id: '1', businessName: 'Tech Solutions', pricingTier: 'professional', totalRevenue: 15000000, monthlyRevenue: 2500000, status: 'active', createdAt: '2024-01-01' },
    { id: '2', businessName: 'Fashion Store', pricingTier: 'basic', totalRevenue: 8000000, monthlyRevenue: 1200000, status: 'active', createdAt: '2024-01-05' },
    { id: '3', businessName: 'Sports Equipment', pricingTier: 'enterprise', totalRevenue: 25000000, monthlyRevenue: 4500000, status: 'active', createdAt: '2024-01-10' },
  ]);

  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLowStockInventory();
        setLowStock(res.list || []);
      } catch {}
    })();
  }, []);

  const [products] = useState<Product[]>([
    { id: '1', name: 'iPhone 15 Pro', price: 15000000, stockQuantity: 25, partnerId: '1', status: 'active', createdAt: '2024-01-15' },
    { id: '2', name: 'Samsung Galaxy S24', price: 12000000, stockQuantity: 0, partnerId: '1', status: 'out_of_stock', createdAt: '2024-01-10' },
    { id: '3', name: 'Nike Air Max', price: 2500000, stockQuantity: 15, partnerId: '3', status: 'active', createdAt: '2024-01-08' },
  ]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/admin-login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprovePartner = async (id: string) => {
    try {
      await approvePartnerRegistration(id);
      // Refresh data
      queryClient.invalidateQueries(['partner-requests']);
    } catch (error) {
      console.error('Error approving partner:', error);
    }
  };

  const handleRejectPartner = async (id: string, reason: string) => {
    try {
      await rejectPartnerRegistration(id, reason);
      // Refresh data
      queryClient.invalidateQueries(['partner-requests']);
    } catch (error) {
      console.error('Error rejecting partner:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Tizim boshqaruvi va monitoring</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Bildirishnomalar
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/activations')}>
                Aktivatsiyalar
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/fulfillment')}>
                Fulfillment
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/fulfillment')}>
                Fulfillment
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName || user.username}
                </p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Jami Hamkorlar</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalPartners}</div>
              <div className="flex items-center text-xs text-blue-700 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3 bu oy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Jami Mahsulotlar</CardTitle>
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.totalProducts}</div>
              <div className="flex items-center text-xs text-green-700 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +45 bu oy
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Oylik Daromad</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="flex items-center text-xs text-purple-700 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +18.5% o'tgan oydan
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Kutilayotgan Arizalar</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.pendingRequests}</div>
              <div className="flex items-center text-xs text-orange-700 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Ko'rib chiqish kerak
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Umumiy ma'lumot</TabsTrigger>
            <TabsTrigger value="partners">Hamkorlar</TabsTrigger>
            <TabsTrigger value="requests">Arizalar</TabsTrigger>
            <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitika</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Tizim holati
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Umumiy ishlash</span>
                      <span>{stats.systemHealth}%</span>
                    </div>
                    <Progress value={stats.systemHealth} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Database</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>API Response</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    So'nggi faollik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Yangi hamkor qo'shildi</p>
                        <p className="text-xs text-gray-500">2 soat oldin</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mahsulot omborga qo'shildi</p>
                        <p className="text-xs text-gray-500">5 soat oldin</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Buyurtma bajarildi</p>
                        <p className="text-xs text-gray-500">1 kun oldin</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Hamkorlar</CardTitle>
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
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{partner.businessName}</h4>
                          <p className="text-sm text-gray-600">{partner.pricingTier} • {formatCurrency(partner.monthlyRevenue)}/oy</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(partner.status)}>
                          {partner.status === 'active' ? 'Faol' : 'Nofaol'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(partner.totalRevenue)}
                        </span>
                        <Button size="sm" variant="outline" onClick={async () => {
                          const next = prompt('Yangi tarif (basic, professional, professional_plus, enterprise):', partner.pricingTier);
                          if (!next) return;
                          await updatePartnerTier(partner.id, next);
                          setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, pricingTier: next } as any : p));
                        }}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Hamkorlik arizalari</CardTitle>
                  <Badge variant="secondary">{stats.pendingRequests} kutilmoqda</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partnerRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <UserPlus className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{request.login}</h4>
                          <p className="text-sm text-gray-600">
                            {request.productCategory} • {formatCurrency(request.investmentAmount)} • {request.productQuantity} dona
                          </p>
                          <p className="text-xs text-gray-500">{request.phone} • {request.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'pending' ? 'Kutilmoqda' : 
                           request.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleApprovePartner(request.id)}
                          disabled={request.status !== 'pending'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tasdiqlash
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectPartner(request.id, 'Ma\'lumotlar yetarli emas')}
                          disabled={request.status !== 'pending'}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Rad etish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mahsulotlar</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi mahsulot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(product.price)} • {product.stockQuantity} dona</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status === 'active' ? 'Faol' : 
                           product.status === 'inactive' ? 'Nofaol' : 'Tugagan'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Partner ID: {product.partnerId}
                        </span>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Tahrirlash
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
                  <CardTitle>Oylik tahlil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Jami daromad</span>
                      <span className="font-medium">{formatCurrency(stats.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hamkorlar soni</span>
                      <span className="font-medium text-blue-600">{stats.totalPartners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mahsulotlar soni</span>
                      <span className="font-medium text-green-600">{stats.totalProducts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Faol buyurtmalar</span>
                      <span className="font-medium text-purple-600">{stats.activeOrders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyingi maqsadlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hamkorlar maqsadi</span>
                      <span className="text-sm text-gray-600">24 / 50</span>
                    </div>
                    <Progress value={48} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daromad maqsadi</span>
                      <span className="text-sm text-gray-600">45M / 100M</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mahsulot maqsadi</span>
                      <span className="text-sm text-gray-600">1234 / 2000</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Tezkor amallar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Yangi hamkor</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  <span className="text-sm">Mahsulot qo'shish</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Hisobotlar</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">Chat qo'llab-quvvatlash</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Tizim sozlamalari</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Low stock panel */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kam qoldiq (low-stock)</CardTitle>
                <Button size="sm" onClick={() => exportInventoryToExcel(lowStock as any)}>
                  <Download className="h-4 w-4 mr-2" /> Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <div className="text-sm text-gray-600">Kam qoldiq mahsulotlar yo'q</div>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-600">SKU: {p.sku} • Stock: {p.stockQuantity} • Threshold: {p.lowStockThreshold}</div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Kam qoldiq</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}