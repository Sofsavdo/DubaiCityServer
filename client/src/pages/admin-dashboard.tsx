import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSystem } from "@/components/chat-system";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3,
  Plus,
  LogOut,
  MessageCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  UserCheck,
  Boxes,
  TrendingUp,
  Edit,
  Download,
  FileText,
  AlertTriangle,
  Warehouse,
  Building,
  TrendingDown,
  DollarSign,
  UserPlus,
  Store,
  User,
  Loader2
} from "lucide-react";
import type { PartnerWithUser, ProductRequestWithDetails, OrderWithDetails, Product, ProductRequest } from "@shared/schema";
import { exportPartnersToExcel, exportInventoryToExcel, exportOrdersToExcel, exportRequestsToExcel } from "@/utils/excelExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithUser | null>(null);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [partnerProfileModalOpen, setPartnerProfileModalOpen] = useState(false);
  const [uzumCredentials, setUzumCredentials] = useState({ apiKey: '', secretKey: '', shopId: '' });
  const [yandexCredentials, setYandexCredentials] = useState({ apiKey: '', campaignId: '', clientId: '' });
  const [connectingMarketplace, setConnectingMarketplace] = useState('');
  const [syncingData, setSyncingData] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    stockQuantity: "",
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || (user as any).role !== 'admin')) {
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
  }, [user, isLoading, toast]);

  // Fetch admin stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/analytics/admin-stats"],
    retry: false,
  });

  // Fetch partners
  const { data: partners = [], isLoading: partnersLoading } = useQuery<any[]>({
    queryKey: ["/api/partners"],
    retry: false,
  });

  // Fetch product requests
  const { data: productRequests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/product-requests"],
    retry: false,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Fetch dashboard charts data
  const { data: chartsData = {}, isLoading: chartsLoading } = useQuery<any>({
    queryKey: ["/api/analytics/dashboard-charts"],
    retry: false,
  });

  // Partner registration requests query
  const { data: registrationRequests = [], isLoading: isLoadingRegistrationRequests } = useQuery<any[]>({
    queryKey: ['/api/partner-registration-requests'],
    retry: false,
  });

  // Partner legal info requests query
  const { data: activationRequests = [], isLoading: isLoadingLegalInfoRequests } = useQuery<any[]>({
    queryKey: ['/api/partner-legal-info-requests'],
    retry: false,
  });

  // Mock warehouse data for selected partner
  const warehouseLoading = false;
  const warehouseData = selectedPartner ? {
    summary: {
      totalProducts: Math.floor(Math.random() * 20) + 5,
      totalStock: Math.floor(Math.random() * 200) + 50,
      totalValue: Math.floor(Math.random() * 5000000) + 1000000,
      totalRevenue: Math.floor(Math.random() * 2000000) + 500000
    },
    products: products.slice(0, 3).map(product => ({
      ...product,
      currentStock: product.stockQuantity || Math.floor(Math.random() * 50) + 1,
      costPrice: Math.floor(Math.random() * 50000) + 10000,
      stockValue: (product.stockQuantity || 10) * (Math.floor(Math.random() * 50000) + 10000),
      revenue: Math.floor(Math.random() * 300000) + 50000,
      profit: Math.floor(Math.random() * 100000) + 20000
    }))
  } : null;

  // Approve partner mutation
  const approvePartnerMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/partners/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Success",
        description: "Partner approved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve partner",
        variant: "destructive",
      });
    },
  });

  // Update registration request status mutation
  const updateRegistrationRequestMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      await apiRequest("PATCH", `/api/partner-registration-requests/${id}`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner-registration-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Muvaffaqiyat",
        description: "So'rov holati yangilandi",
      });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "So'rov holatini yangilashda xatolik",
        variant: "destructive",
      });
    },
  });

  // Update activation request status mutation  
  const updateActivationRequestMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      await apiRequest("PATCH", `/api/partner-legal-info/${id}/activation`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner-legal-info-requests"] });
      toast({
        title: "Muvaffaqiyat",
        description: "Aktivatsiya holati yangilandi",
      });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "Aktivatsiya holatini yangilashda xatolik",
        variant: "destructive",
      });
    },
  });

  // Sync marketplace data functions
  const syncUzumMarketData = async (integrationId: string, dataType: 'products' | 'orders') => {
    setSyncingData(true);
    try {
      const response = await apiRequest('POST', `/api/admin/uzum-market/${integrationId}/sync-${dataType}`, {}) as any;
      toast({
        title: "Muvaffaqiyat",
        description: response.message || `${dataType === 'products' ? 'Mahsulotlar' : 'Buyurtmalar'} sinxronlashtirildi`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: `${dataType === 'products' ? 'Mahsulotlar' : 'Buyurtmalar'}ni sinxronlashda xatolik`,
        variant: "destructive",
      });
    } finally {
      setSyncingData(false);
    }
  };

  const syncYandexMarketData = async (integrationId: string, dataType: 'products' | 'orders') => {
    setSyncingData(true);
    try {
      const response = await apiRequest('POST', `/api/admin/yandex-market/${integrationId}/sync-${dataType}`, {}) as any;
      toast({
        title: "Muvaffaqiyat",
        description: response.message || `${dataType === 'products' ? 'Mahsulotlar' : 'Buyurtmalar'} sinxronlashtirildi`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: `${dataType === 'products' ? 'Mahsulotlar' : 'Buyurtmalar'}ni sinxronlashda xatolik`,
        variant: "destructive",
      });
    } finally {
      setSyncingData(false);
    }
  };

  // Connect marketplace function
  const connectMarketplace = useMutation({
    mutationFn: async ({ partnerId, marketplace, credentials }: {
      partnerId: string;
      marketplace: 'uzum' | 'yandex';
      credentials: any;
    }) => {
      return apiRequest('POST', `/api/admin/partners/${partnerId}/marketplace-integration`, {
        marketplace,
        credentials,
        isActive: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Marketplace muvaffaqiyatli ulandi!",
      });
      setConnectingMarketplace('');
      setUzumCredentials({ apiKey: '', secretKey: '', shopId: '' });
      setYandexCredentials({ apiKey: '', campaignId: '', clientId: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Xatolik",
        description: "Marketplace ulanishda xatolik yuz berdi",
        variant: "destructive",
      });
      setConnectingMarketplace('');
    },
  });

  const handleMarketplaceConnect = (marketplace: 'uzum' | 'yandex') => {
    if (!selectedPartner) return;
    
    const credentials = marketplace === 'uzum' ? uzumCredentials : yandexCredentials;
    
    // Validate credentials
    if (marketplace === 'uzum') {
      const uzumCreds = credentials as { apiKey: string; secretKey: string; shopId: string };
      if (!uzumCreds.apiKey || !uzumCreds.secretKey || !uzumCreds.shopId) {
        toast({
          title: "Xatolik",
          description: "Barcha maydonlarni to'ldiring",
          variant: "destructive",
        });
        return;
      }
    } else {
      const yandexCreds = credentials as { apiKey: string; campaignId: string; clientId: string };
      if (!yandexCreds.apiKey || !yandexCreds.campaignId || !yandexCreds.clientId) {
        toast({
          title: "Xatolik", 
          description: "Barcha maydonlarni to'ldiring",
          variant: "destructive",
        });
        return;
      }
    }

    setConnectingMarketplace(marketplace);
    connectMarketplace.mutate({
      partnerId: selectedPartner.id,
      marketplace,
      credentials
    });
  };

  // Update product request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      await apiRequest("PUT", `/api/product-requests/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setNewProduct({ name: "", description: "", sku: "", price: "", stockQuantity: "" });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleApprovePartner = (userId: string) => {
    approvePartnerMutation.mutate(userId);
  };

  const handleUpdateRequestStatus = (id: string, status: string, notes?: string) => {
    updateRequestMutation.mutate({ id, status, notes });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...newProduct,
      price: parseFloat(newProduct.price),
      stockQuantity: parseInt(newProduct.stockQuantity) || 0,
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const openWarehouseModal = (partner: PartnerWithUser) => {
    setSelectedPartner(partner);
    setWarehouseModalOpen(true);
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Kutilmoqda</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tasdiqlandi</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rad etildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || !user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Yuklanmoqda...</p>
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
              <h1 className="text-2xl font-bold text-primary">MarketPlace Pro</h1>
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Admin Boshqaruv Paneli
          </h2>
          <p className="text-neutral-600">Bugun: {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>

        {/* Admin Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          <Card data-testid="stat-partners">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600 mb-1">Jami Hamkorlar</p>
                  <p className="text-lg md:text-xl font-bold text-neutral-900">
                    {statsLoading ? "-" : (stats as any)?.totalPartners || 0}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-sales">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600 mb-1">Jami Sotuv</p>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-lg font-bold text-neutral-900 break-all">
                      {chartsLoading ? "-" : `${((chartsData as any)?.summary?.totalSales || 0).toLocaleString()}`}
                    </span>
                    <span className="text-xs text-neutral-500">so'm</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-partner-profit">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600 mb-1">Hamkorlar Foydasi</p>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-lg font-bold text-blue-600 break-all">
                      {chartsLoading ? "-" : `${((chartsData as any)?.summary?.partnerProfit || 0).toLocaleString()}`}
                    </span>
                    <span className="text-xs text-neutral-500">so'm</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-fulfillment-profit">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600 mb-1">Fulfilment Foydasi</p>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-lg font-bold text-purple-600 break-all">
                      {chartsLoading ? "-" : `${((chartsData as any)?.summary?.fulfillmentProfit || 0).toLocaleString()}`}
                    </span>
                    <span className="text-xs text-neutral-500">so'm</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Warehouse className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-avg-order">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600 mb-1">O'rtacha Buyurtma</p>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-lg font-bold text-orange-600 break-all">
                      {chartsLoading ? "-" : `${Math.round((chartsData as any)?.summary?.avgOrderValue || 0).toLocaleString()}`}
                    </span>
                    <span className="text-xs text-neutral-500">so'm</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistika
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests" className="relative">
              <Package className="w-4 h-4 mr-2" />
              So'rovlar
              {/* Show notification if there are pending requests */}
              {(((productRequests as any[])?.filter((r: any) => r.status === 'pending').length || 0) + 
                ((registrationRequests as any[])?.filter((r: any) => r.status === 'pending').length || 0) + 
                ((activationRequests as any[])?.filter((r: any) => r.activationStatus === 'pending').length || 0)) > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {(((productRequests as any[])?.filter((r: any) => r.status === 'pending').length || 0) + 
                    ((registrationRequests as any[])?.filter((r: any) => r.status === 'pending').length || 0) + 
                    ((activationRequests as any[])?.filter((r: any) => r.activationStatus === 'pending').length || 0))}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="partners" data-testid="tab-partners">
              <Users className="w-4 h-4 mr-2" />
              Hamkorlar
            </TabsTrigger>
            <TabsTrigger value="fulfillment" data-testid="tab-fulfillment">
              <Warehouse className="w-4 h-4 mr-2" />
              MySklad
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              Hisobotlar
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buyurtmalar
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">


            {/* Charts Section */}
            {chartsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-6 bg-neutral-200 rounded w-1/3 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] bg-neutral-100 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : chartsData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Sales & Profit Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Oylik Sotuv va Foyda Dinamikasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartsData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => {
                            if (value >= 1000000) {
                              return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K`;
                            }
                            return value.toString();
                          }}
                          width={50}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString()} so'm`,
                            name === 'sales' ? 'Sotuv' : 'Foyda'
                          ]}
                        />
                        <Bar dataKey="sales" fill="#3b82f6" name="sales" />
                        <Bar dataKey="profit" fill="#10b981" name="profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Kategoriyalar Bo'yicha Taqsimot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartsData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartsData.categoryData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Partners Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Hamkorlar Soni O'sishi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartsData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => {
                            if (value >= 1000000) {
                              return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K`;
                            }
                            return value.toString();
                          }}
                          width={50}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value} ta`, 'Hamkorlar']}
                        />
                        <Line type="monotone" dataKey="partners" stroke="#8b5cf6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Partners */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Top Hamkorlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chartsData.topPartners?.map((partner: any, index: number) => (
                        <div key={partner.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-700">#{index + 1}</span>
                            </div>
                            <span className="font-medium">{partner.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {partner.sales.toLocaleString()} so'm
                            </div>
                            <div className="text-xs text-neutral-500">
                              Foyda: +{partner.profit.toLocaleString()} so'm
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500">Grafik ma'lumotlari yuklanmadi</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Partner Registration Requests */}
              <Card data-testid="card-partner-registration-requests" className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Yangi Hamkor So'rovlari
                      {registrationRequests?.filter(r => r.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          +{registrationRequests.filter(r => r.status === 'pending').length}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{registrationRequests?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {registrationRequests?.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Yangi hamkor ro'yxatdan o'tish so'rovlari yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrationRequests?.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{request.fullName}</h4>
                            <p className="text-sm text-neutral-600">Login: {request.login}</p>
                            <p className="text-sm text-neutral-600">Telefon: {request.phoneNumber}</p>
                            <p className="text-sm text-neutral-600">Manzil: {request.address}</p>
                          </div>
                          <Badge variant={request.status === 'pending' ? 'secondary' : 
                                        request.status === 'approved' ? 'default' : 'destructive'}>
                            {request.status === 'pending' ? 'Kutilmoqda' : 
                             request.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                          </Badge>
                        </div>
                        <div className="text-sm text-neutral-600 mb-3">
                          <p><strong>Mahsulot Toifasi:</strong> {request.productCategory}</p>
                          <p><strong>Investitsiya:</strong> {request.investmentAmount} so'm</p>
                          {request.businessExperience && (
                            <p><strong>Tajriba:</strong> {request.businessExperience}</p>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateRegistrationRequestMutation.mutate({
                                id: request.id,
                                status: 'approved'
                              })}
                              disabled={updateRegistrationRequestMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Tasdiqlash
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRegistrationRequestMutation.mutate({
                                id: request.id,
                                status: 'rejected',
                                rejectionReason: 'Talablar bajarilmagan'
                              })}
                              disabled={updateRegistrationRequestMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rad etish
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Partner Legal Info & Activation Requests */}
              <Card data-testid="card-partner-activation-requests" className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Aktivatsiya So'rovlari
                      {activationRequests?.filter(r => r.activationStatus === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          +{activationRequests.filter(r => r.activationStatus === 'pending').length}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{activationRequests?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {activationRequests?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Hamkor aktivatsiya so'rovlari yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activationRequests?.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{request.companyName}</h4>
                            <p className="text-sm text-neutral-600">INN: {request.inn}</p>
                            <p className="text-sm text-neutral-600">Bank: {request.bankName}</p>
                            <p className="text-sm text-neutral-600">Hisob: {request.bankAccount}</p>
                          </div>
                          <Badge variant={request.activationStatus === 'pending' ? 'secondary' : 
                                        request.activationStatus === 'approved' ? 'default' : 'destructive'}>
                            {request.activationStatus === 'pending' ? 'Kutilmoqda' : 
                             request.activationStatus === 'approved' ? 'Faollashtirilgan' : 'Rad etilgan'}
                          </Badge>
                        </div>
                        <div className="text-sm text-neutral-600 mb-3">
                          <p><strong>Obuna Tarifi:</strong> {request.subscriptionTier}</p>
                          <p><strong>Yuridik Manzil:</strong> {request.legalAddress}</p>
                          {request.additionalInfo && (
                            <p><strong>Qo'shimcha Ma'lumot:</strong> {request.additionalInfo}</p>
                          )}
                        </div>
                        {request.activationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateActivationRequestMutation.mutate({
                                id: request.id,
                                status: 'approved'
                              })}
                              disabled={updateActivationRequestMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Faollashtirish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateActivationRequestMutation.mutate({
                                id: request.id,
                                status: 'rejected',
                                rejectionReason: 'Hujjatlar noto\'g\'ri'
                              })}
                              disabled={updateActivationRequestMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rad etish
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Product Supply Requests */}
              <Card data-testid="card-product-requests" className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Mahsulot Taminoti So'rovlari
                      {productRequests?.filter(r => r.status === 'pending').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          +{productRequests.filter(r => r.status === 'pending').length}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{productRequests?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : productRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Mahsulot so'rovlari yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productRequests.map((request: ProductRequestWithDetails) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{request.productName}</h4>
                            <p className="text-sm text-neutral-600">
                              Hamkor: {request.partner.user.firstName || request.partner.user.email}
                            </p>
                            <p className="text-sm text-neutral-600">Miqdor: {request.expectedQuantity}</p>
                          </div>
                          <Badge variant={request.status === 'pending' ? 'secondary' : 
                                        request.status === 'approved' ? 'default' : 'destructive'}>
                            {request.status === 'pending' ? 'Kutilmoqda' : 
                             request.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                          </Badge>
                        </div>
                        {request.description && (
                          <p className="text-sm text-neutral-600 mb-3">
                            <strong>Tavsif:</strong> {request.description}
                          </p>
                        )}
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                              disabled={updateRequestMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Tasdiqlash
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRequestStatus(request.id, 'rejected', 'Talablar bajarilmagan')}
                              disabled={updateRequestMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rad etish
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card data-testid="card-partners">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Hamkorlar Ro'yxati
                  <Badge variant="outline">{partners.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partnersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : partners.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">Hamkorlar mavjud emas</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hamkor</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Biznes Nomi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Profil</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners.map((partner: PartnerWithUser) => (
                          <TableRow key={partner.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={partner.user.profileImageUrl || ""} />
                                  <AvatarFallback>
                                    {(partner.user.firstName?.[0] || partner.user.email?.[0] || 'U').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium" data-testid={`text-partner-name-${partner.id}`}>
                                  {partner.user.firstName || partner.user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`text-partner-email-${partner.id}`}>
                              {partner.user.email}
                            </TableCell>
                            <TableCell data-testid={`text-business-name-${partner.id}`}>
                              {partner.businessName || "-"}
                            </TableCell>
                            <TableCell>
                              {partner.user.isApproved ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Tasdiqlangan
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Kutilmoqda
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!partner.user.isApproved && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovePartner(partner.user.id)}
                                    className="bg-accent hover:bg-green-600"
                                    data-testid={`button-approve-partner-${partner.id}`}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Tasdiqlash
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPartner(partner);
                                    setPartnerProfileModalOpen(true);
                                  }}
                                  className="text-xs"
                                  data-testid={`button-profile-${partner.id}`}
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  Profil
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Workflow Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900">To'g'ri Workflow: MySklad Mahsulotlar Boshqaruvi</h4>
                  <p className="text-amber-700 text-sm mt-1">
                    🔄 Hamkor so'rov yuboradi → 👨‍💼 Admin ko'rib chiqadi → ✏️ Kerak bo'lsa tahrirlaydi → ✅ Tasdiqlaydi → 📦 MySklad'ga qo'shiladi
                  </p>
                  <p className="text-amber-600 text-xs mt-2">
                    MySklad - bizning ichki inventar tizimi. Uzum/Yandex Market API orqali avtomatik savdo.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Product Requests Management */}
            <Card data-testid="card-product-requests-management">
              <CardHeader>
                <CardTitle>Hamkor So'rovlarini Boshqarish</CardTitle>
                <CardDescription>
                  Hamkorlardan keladigan mahsulot qo'shish so'rovlarini ko'rib chiqing, tahrirlay va tasdiqlang
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Hamkorlardan so'rovlar kelishi kutilmoqda</p>
                    <p className="text-sm text-neutral-400 mt-2">Hamkorlar mahsulot so'rovi yuborishi bilan bu yerda ko'rinadi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productRequests.map((request: ProductRequest) => (
                      <Card key={request.id} className="border border-neutral-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-neutral-900">{request.productName}</h4>
                                <Badge 
                                  variant={request.status === 'pending' ? 'secondary' : 
                                          request.status === 'approved' ? 'default' : 'destructive'}
                                  className={request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                           request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                           'bg-red-100 text-red-800'}
                                >
                                  {request.status === 'pending' ? 'Kutilmoqda' :
                                   request.status === 'approved' ? 'Tasdiqlangan' : 
                                   request.status === 'rejected' ? 'Rad etilgan' : request.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-neutral-600 mb-2">
                                Miqdor: {request.expectedQuantity || (request as any).quantity} • 
                                Narx: {request.estimatedPrice ? `${Number(request.estimatedPrice).toLocaleString()} so'm` : 'Ko\'rsatilmagan'}
                              </p>
                              {request.description && (
                                <p className="text-xs text-neutral-500 mb-2">{request.description}</p>
                              )}
                              {request.supplierInfo && (
                                <p className="text-xs text-neutral-500 mb-2">Ta'minotchi: {request.supplierInfo}</p>
                              )}
                              <p className="text-xs text-neutral-400">
                                So'rov vaqti: {request.createdAt ? new Date(request.createdAt).toLocaleDateString('uz-UZ') : 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Tasdiqlash
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Tahrirlash
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                    <X className="w-4 h-4 mr-1" />
                                    Rad etish
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* MySklad Fulfillment Center */}
          <TabsContent value="fulfillment" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Warehouse className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">MySklad Fulfilment Markazi</h3>
                    <p className="text-blue-700">Markazlashtirilgan inventar va hamkorlarning mahsulotlari</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Umumiy Sklad
                </Badge>
              </div>
            </div>

            {/* Overall MySklad Inventory */}
            <Card data-testid="card-mysklad-inventory">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5" />
                    Umumiy MySklad Inventari
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{products.length} tur mahsulot</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportInventoryToExcel(products)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Barcha hamkorlarning tasdiqlangan mahsulotlari. Uzum/Yandex Market API orqali avtomatik yangilanadi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Boxes className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Hozircha tasdiqlangan mahsulotlar yo'q</p>
                    <p className="text-sm text-neutral-400">Hamkor so'rovlari tasdiqlangandan keyin bu yerda paydo bo'ladi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Stock Status Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {products.filter(p => (p.stockQuantity || 0) > 10).length}
                        </div>
                        <div className="text-sm text-neutral-600">Yaxshi Zaxira</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {products.filter(p => (p.stockQuantity || 0) <= 10 && (p.stockQuantity || 0) > 5).length}
                        </div>
                        <div className="text-sm text-neutral-600">Kam Qolgan</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {products.filter(p => (p.stockQuantity || 0) <= 5).length}
                        </div>
                        <div className="text-sm text-neutral-600">Kritik</div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mahsulot</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Narx</TableHead>
                            <TableHead>Zaxira</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Hamkor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product: Product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="text-sm text-neutral-600">{product.sku}</TableCell>
                              <TableCell>{Number(product.price).toLocaleString()} so'm</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className={`font-semibold ${
                                    (product.stockQuantity || 0) <= 5 ? 'text-red-600' :
                                    (product.stockQuantity || 0) <= 10 ? 'text-orange-600' : 'text-green-600'
                                  }`}>
                                    {product.stockQuantity || 0}
                                  </span>
                                  {(product.stockQuantity || 0) <= 5 && (
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={`${
                                    (product.stockQuantity || 0) <= 5 ? 'bg-red-100 text-red-800' :
                                    (product.stockQuantity || 0) <= 10 ? 'bg-orange-100 text-orange-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {(product.stockQuantity || 0) <= 5 ? 'Kritik' :
                                   (product.stockQuantity || 0) <= 10 ? 'Kam' : 'Yaxshi'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                      H{Math.floor(Math.random() * 9) + 1}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-neutral-700">
                                    {`Hamkor ${Math.floor(Math.random() * 10) + 1}`}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Reports Section */}
          <TabsContent value="reports" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Professional Hisobotlar</h3>
                  <p className="text-green-700">Excel, PDF ko'rinishida detalli statistik hisobotlar</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Partner Performance Report */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Hamkor Statistikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-neutral-600">
                    Har bir hamkorning sotish statistikasi, foydasi va reytingi
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Jami hamkorlar:</span>
                      <span className="font-semibold">{partners.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Faol hamkorlar:</span>
                      <span className="font-semibold text-green-600">{partners.filter(p => p.status === 'active').length}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    variant="outline"
                    onClick={() => exportPartnersToExcel(partners)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel Yuklab Olish
                  </Button>
                </CardContent>
              </Card>

              {/* Inventory Report */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Boxes className="w-4 h-4 mr-2 text-orange-600" />
                    Inventar Hisoboti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-neutral-600">
                    MySklad inventari, kam qolgan mahsulotlar va ta'minot kerakligi
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Jami mahsulotlar:</span>
                      <span className="font-semibold">{products.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Kam qolgan:</span>
                      <span className="font-semibold text-orange-600">
                        {products.filter(p => (p.stockQuantity || 0) <= 10).length}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    variant="outline"
                    onClick={() => exportInventoryToExcel(products)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel Yuklab Olish
                  </Button>
                </CardContent>
              </Card>

              {/* Sales Report */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Savdo Hisoboti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-neutral-600">
                    Uzum/Yandex Market orqali savdo hajmi va daromad statistikasi
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Jami buyurtmalar:</span>
                      <span className="font-semibold">{orders.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Bugungi savdo:</span>
                      <span className="font-semibold text-green-600">
                        {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    variant="outline"
                    onClick={() => exportOrdersToExcel(orders)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel Yuklab Olish
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card data-testid="card-orders-admin">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Barcha Buyurtmalar
                  <Badge variant="outline">{orders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">Buyurtmalar mavjud emas</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hamkor</TableHead>
                          <TableHead>Mijoz</TableHead>
                          <TableHead>Mahsulot</TableHead>
                          <TableHead>Miqdor</TableHead>
                          <TableHead>Summa</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sana</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: OrderWithDetails) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={order.partner.user.profileImageUrl || ""} />
                                  <AvatarFallback className="text-xs">
                                    {(order.partner.user.firstName?.[0] || order.partner.user.email?.[0] || 'U').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm" data-testid={`text-order-partner-${order.id}`}>
                                  {order.partner.user.firstName || order.partner.user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell data-testid={`text-order-customer-${order.id}`}>
                              {order.customerName}
                            </TableCell>
                            <TableCell data-testid={`text-order-product-${order.id}`}>
                              {order.product.name}
                            </TableCell>
                            <TableCell data-testid={`text-order-quantity-${order.id}`}>
                              {order.quantity}
                            </TableCell>
                            <TableCell data-testid={`text-order-amount-${order.id}`}>
                              {Number(order.totalAmount).toLocaleString()} so'm
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(order.status || 'pending')}
                            </TableCell>
                            <TableCell data-testid={`text-order-date-${order.id}`}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('uz-UZ') : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <ChatSystem />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mini Warehouse Modal */}
      <Dialog open={warehouseModalOpen} onOpenChange={setWarehouseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Warehouse className="h-5 w-5" />
              <span>{selectedPartner?.businessName} - Mini Sklad</span>
            </DialogTitle>
          </DialogHeader>
          
          {warehouseLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Sklad ma'lumotlari yuklanmoqda...</span>
            </div>
          ) : warehouseData ? (
            <div className="space-y-6">
              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Mahsulotlar Ro'yxati</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nomi</TableHead>
                          <TableHead>Rasm</TableHead>
                          <TableHead>Qoldiq</TableHead>
                          <TableHead>Sebestoimost</TableHead>
                          <TableHead>Jami Qiymat</TableHead>
                          <TableHead>Daromad</TableHead>
                          <TableHead>Foyda</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouseData.products.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>
                              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-neutral-400" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.currentStock <= 5 ? "destructive" : "secondary"}>
                                {product.currentStock}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.costPrice.toLocaleString()} so'm
                            </TableCell>
                            <TableCell>
                              {product.stockValue.toLocaleString()} so'm
                            </TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {product.revenue.toLocaleString()} so'm
                            </TableCell>
                            <TableCell className="text-blue-600 font-medium">
                              {product.profit.toLocaleString()} so'm
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">Sklad ma'lumotlari topilmadi</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Partner Profile Modal - Comprehensive view */}
      <Dialog open={partnerProfileModalOpen} onOpenChange={setPartnerProfileModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{selectedPartner?.businessName || selectedPartner?.user.email} - Hamkor Profili</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-6">
              {/* Partner Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Hamkor Ma'lumotlari</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedPartner.user.profileImageUrl || ""} />
                          <AvatarFallback>
                            {(selectedPartner.user.firstName?.[0] || selectedPartner.user.email?.[0] || 'H').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedPartner.user.firstName || selectedPartner.user.email || 'Hamkor'}</h3>
                          <p className="text-sm text-neutral-600">{selectedPartner.user.email || ''}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Biznes Nomi:</span>
                          <span className="text-sm font-medium">{selectedPartner.businessName || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Status:</span>
                          <Badge variant={selectedPartner.user.isApproved ? 'default' : 'secondary'}>
                            {selectedPartner.user.isApproved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Qo'shilgan sana:</span>
                          <span className="text-sm">{selectedPartner.createdAt ? new Date(selectedPartner.createdAt).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Obuna Tarifi:</span>
                          <span className="text-sm font-medium">
                            {selectedPartner.pricingTier === 'basic' ? 'Basic (2.5M so\'m/oy)' :
                             selectedPartner.pricingTier === 'professional' ? 'Professional (4.5M so\'m/oy)' :
                             selectedPartner.pricingTier === 'enterprise' ? 'Enterprise (6.5M so\'m/oy)' :
                             'Basic (2.5M so\'m/oy)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-600">Komissiya:</span>
                          <span className="text-sm font-medium">
                            {selectedPartner.pricingTier === 'basic' ? '12%' :
                             selectedPartner.pricingTier === 'professional' ? '15%' :
                             selectedPartner.pricingTier === 'enterprise' ? '18%' : '12%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner Statistics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Hamkor Statistikalari</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-700">0</div>
                        <div className="text-xs text-blue-600">Buyurtmalar</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-700">0</div>
                        <div className="text-xs text-green-600">Daromad (so'm)</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-700">0</div>
                        <div className="text-xs text-purple-600">Mahsulotlar</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-700">0%</div>
                        <div className="text-xs text-orange-600">O'sish</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="warehouse" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="warehouse" className="flex items-center space-x-2">
                    <Warehouse className="h-4 w-4" />
                    <span>Mini Sklad</span>
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="flex items-center space-x-2">
                    <Store className="h-4 w-4" />
                    <span>Marketplace</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Tahlil</span>
                  </TabsTrigger>
                </TabsList>

                {/* Mini Sklad Tab */}
                <TabsContent value="warehouse" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sklad Holati</CardTitle>
                      <CardDescription>Hamkor skladidagi mahsulotlar va ularning holati</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {warehouseLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Yuklanmoqda...</span>
                        </div>
                      ) : warehouseData ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Mahsulot</TableHead>
                                <TableHead>Rasm</TableHead>
                                <TableHead>Qoldiq</TableHead>
                                <TableHead>Narx</TableHead>
                                <TableHead>Jami Qiymat</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {warehouseData.products.slice(0, 5).map((product: any) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>
                                    <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
                                      {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded" />
                                      ) : (
                                        <Package className="w-5 h-5 text-neutral-400" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{product.stockQuantity}</TableCell>
                                  <TableCell>{product.costPrice.toLocaleString()} so'm</TableCell>
                                  <TableCell>{product.stockValue.toLocaleString()} so'm</TableCell>
                                  <TableCell>
                                    <Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'}>
                                      {product.stockQuantity > 0 ? 'Mavjud' : 'Tugagan'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          Sklad ma'lumotlari topilmadi
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Marketplace Tab */}
                <TabsContent value="marketplace" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Marketplace Integratsiyalari</CardTitle>
                      <CardDescription>Hamkor ulangan marketplace'lar va ularning holati</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Uzum Market Integration */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Store className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium">Uzum Market</span>
                            </div>
                            {selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'uzum_market') ? (
                              <div className="flex items-center space-x-2">
                                <Badge variant="default">Ulangan</Badge>
                                <div className="flex space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const integration = selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'uzum_market');
                                      if (integration) syncUzumMarketData(integration.id, 'products');
                                    }}
                                    disabled={syncingData}
                                  >
                                    {syncingData ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mahsulot'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const integration = selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'uzum_market');
                                      if (integration) syncUzumMarketData(integration.id, 'orders');
                                    }}
                                    disabled={syncingData}
                                  >
                                    {syncingData ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buyurtma'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Badge variant="destructive">Ulanmagan</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="uzum-api-key" className="text-sm">API Key</Label>
                              <Input
                                id="uzum-api-key"
                                type="password"
                                placeholder="API kalitini kiriting"
                                value={uzumCredentials.apiKey}
                                onChange={(e) => setUzumCredentials({...uzumCredentials, apiKey: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="uzum-secret-key" className="text-sm">Secret Key</Label>
                              <Input
                                id="uzum-secret-key"
                                type="password"
                                placeholder="Maxfiy kalitni kiriting"
                                value={uzumCredentials.secretKey}
                                onChange={(e) => setUzumCredentials({...uzumCredentials, secretKey: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="uzum-shop-id" className="text-sm">Shop ID</Label>
                              <Input
                                id="uzum-shop-id"
                                placeholder="Do'kon ID raqamini kiriting"
                                value={uzumCredentials.shopId}
                                onChange={(e) => setUzumCredentials({...uzumCredentials, shopId: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleMarketplaceConnect('uzum')}
                              disabled={connectingMarketplace === 'uzum'}
                            >
                              {connectingMarketplace === 'uzum' ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Ulanmoqda...
                                </>
                              ) : (
                                'Saqlash va Ulash'
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Yandex Market Integration */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Store className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium">Yandex Market</span>
                            </div>
                            {selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'yandex_market') ? (
                              <div className="flex items-center space-x-2">
                                <Badge variant="default">Ulangan</Badge>
                                <div className="flex space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const integration = selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'yandex_market');
                                      if (integration) syncYandexMarketData(integration.id, 'products');
                                    }}
                                    disabled={syncingData}
                                  >
                                    {syncingData ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mahsulot'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const integration = selectedPartner?.marketplaceIntegrations?.find(int => int.marketplace === 'yandex_market');
                                      if (integration) syncYandexMarketData(integration.id, 'orders');
                                    }}
                                    disabled={syncingData}
                                  >
                                    {syncingData ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buyurtma'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Badge variant="destructive">Ulanmagan</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="yandex-api-key" className="text-sm">API Key</Label>
                              <Input
                                id="yandex-api-key"
                                type="password"
                                placeholder="API kalitini kiriting"
                                value={yandexCredentials.apiKey}
                                onChange={(e) => setYandexCredentials({...yandexCredentials, apiKey: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="yandex-campaign-id" className="text-sm">Campaign ID</Label>
                              <Input
                                id="yandex-campaign-id"
                                placeholder="Kampaniya ID raqamini kiriting"
                                value={yandexCredentials.campaignId}
                                onChange={(e) => setYandexCredentials({...yandexCredentials, campaignId: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="yandex-client-id" className="text-sm">Client ID</Label>
                              <Input
                                id="yandex-client-id"
                                placeholder="Mijoz ID raqamini kiriting"
                                value={yandexCredentials.clientId}
                                onChange={(e) => setYandexCredentials({...yandexCredentials, clientId: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleMarketplaceConnect('yandex')}
                              disabled={connectingMarketplace === 'yandex'}
                            >
                              {connectingMarketplace === 'yandex' ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Ulanmoqda...
                                </>
                              ) : (
                                'Saqlash va Ulash'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Oylik Sotuv</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-neutral-500">
                          Sotuv ma'lumotlari mavjud emas
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Foyda Dinamikasi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-neutral-500">
                          Foyda ma'lumotlari mavjud emas
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
