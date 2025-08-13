import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatSystem } from "@/components/chat-system";
import { EnhancedProductRequestForm } from "@/components/enhanced-product-request-form";
import { PartnerActivationForm } from "@/components/partner-activation-form";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Plus,
  LogOut,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Clock,
  X,
  DollarSign,
  Warehouse
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { ProductRequest, Order, Product } from "@shared/schema";

export default function PartnerDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [newProductRequest, setNewProductRequest] = useState({
    productName: "",
    quantity: "",
    notes: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  // Fetch partner stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/partner-stats"],
    retry: false,
  });

  // Fetch charts data
  const { data: chartsData = {}, isLoading: chartsLoading } = useQuery({
    queryKey: ["/api/analytics/partner-charts"],
    retry: false,
  });

  // Fetch product requests
  const { data: productRequests = [], isLoading: requestsLoading } = useQuery<ProductRequest[]>({
    queryKey: ["/api/product-requests"],
    retry: false,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Fetch available products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Get current partner data
  const { data: partner } = useQuery({
    queryKey: ['/api/partners/me'],
    enabled: !!user,
    retry: false,
  });

  // Fetch partner warehouse data
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ["/api/partners", partner?.id, "warehouse"],
    enabled: !!partner?.id && warehouseModalOpen,
    retry: false,
  });

  // Create product request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/product-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      setNewProductRequest({ productName: "", quantity: "", notes: "" });
      toast({
        title: "Success",
        description: "Product request submitted successfully",
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
        description: "Failed to submit product request",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductRequest.productName || !newProductRequest.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      ...newProductRequest,
      quantity: parseInt(newProductRequest.quantity),
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

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

  if (isLoading || !user) {
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
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Hamkor Dashboard
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
            Xush kelibsiz, {(user as any)?.firstName || (user as any)?.email || 'Hamkor'}!
          </h2>
          <p className="text-neutral-600">Bugun: {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>

        {/* Partner Stats - Only Net Profit, Sales Monitoring, MySklad Inventory */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card data-testid="card-net-profit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sizning Sof Foydangiz</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading 
                  ? <div className="animate-pulse bg-neutral-200 h-8 w-32 rounded"></div>
                  : `${((stats?.totalRevenue || 0) * 0.80).toLocaleString()} so'm`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Fulfillment xizmat haqqidan keyin
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-sales">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umumiy Savdo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading 
                  ? <div className="animate-pulse bg-neutral-200 h-8 w-32 rounded"></div>
                  : `${(stats?.totalRevenue || 0).toLocaleString()} so'm`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Jami savdo hajmi
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buyurtmalar</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading 
                  ? <div className="animate-pulse bg-neutral-200 h-8 w-32 rounded"></div>
                  : (stats?.totalOrders || 0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Jami buyurtmalar
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-mysklad-inventory">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MySklad Qoldiq</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading 
                  ? <div className="animate-pulse bg-neutral-200 h-8 w-32 rounded"></div>
                  : (stats?.activeProducts || 0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Faol mahsulotlar soni
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistika
            </TabsTrigger>
            <TabsTrigger value="activation" data-testid="tab-activation">
              <CheckCircle className="w-4 h-4 mr-2" />
              Aktivatsiya
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Package className="w-4 h-4 mr-2" />
              So'rovlar
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
            {/* Charts Section for Partner */}
            {chartsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
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
                {/* Partner Sales Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Sizning Sotuv Ko'rsatkichlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartsData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [
                            `${value.toLocaleString()} so'm`,
                            'Sizning Sotuvingiz'
                          ]}
                        />
                        <Bar dataKey="partnerSales" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Commission Earnings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Oylik Komissiya Daromadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartsData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toLocaleString()} so'm`, 'Komissiya']}
                        />
                        <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Product Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Top Sotilgan Mahsulotlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chartsData.topProducts?.map((product: any, index: number) => (
                        <div key={product.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-700">#{index + 1}</span>
                            </div>
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <div className="text-xs text-neutral-500">SKU: {product.sku}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {product.sold} dona
                            </div>
                            <div className="text-xs text-neutral-500">
                              Daromad: {product.revenue.toLocaleString()} so'm
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Orders Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      So'nggi Buyurtmalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="text-neutral-500 text-center py-4">Buyurtmalar mavjud emas</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order: Order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div>
                              <p className="font-medium text-neutral-900" data-testid={`text-customer-${order.id}`}>
                                {order.customerName}
                              </p>
                              <p className="text-sm text-neutral-600" data-testid={`text-quantity-${order.id}`}>
                                Miqdor: {order.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-accent" data-testid={`text-amount-${order.id}`}>
                                {Number(order.totalAmount).toLocaleString()} so'm
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(order.createdAt || new Date()).toLocaleDateString('uz-UZ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

          <TabsContent value="activation" className="space-y-6">
            <PartnerActivationForm />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {/* Use the enhanced ProductRequestForm */}
            <EnhancedProductRequestForm />

            {/* Existing Requests */}
            <Card data-testid="card-existing-requests">
              <CardHeader>
                <CardTitle>Mavjud So'rovlar</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : productRequests.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4">So'rovlar mavjud emas</p>
                ) : (
                  <div className="space-y-4">
                    {productRequests.map((request: ProductRequest) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900" data-testid={`text-request-name-${request.id}`}>
                            {request.productName}
                          </h4>
                          <p className="text-sm text-neutral-600" data-testid={`text-request-quantity-${request.id}`}>
                            Miqdor: {request.quantity}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-neutral-500 mt-1" data-testid={`text-request-notes-${request.id}`}>
                              {request.notes}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 mt-2">
                            {new Date(request.createdAt || new Date()).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(request.status || 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card data-testid="card-all-orders">
              <CardHeader>
                <CardTitle>Barcha Buyurtmalar</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4">Buyurtmalar mavjud emas</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: Order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900" data-testid={`text-order-customer-${order.id}`}>
                            {order.customerName}
                          </h4>
                          <p className="text-sm text-neutral-600" data-testid={`text-order-quantity-${order.id}`}>
                            Miqdor: {order.quantity}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {new Date(order.createdAt || new Date()).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-accent" data-testid={`text-order-amount-${order.id}`}>
                            {Number(order.totalAmount).toLocaleString()} so'm
                          </p>
                          <Badge variant="outline">{order.status || 'pending'}</Badge>
                        </div>
                      </div>
                    ))}
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

      {/* MySklad Inventory Modal */}
      <Dialog open={warehouseModalOpen} onOpenChange={setWarehouseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Warehouse className="h-5 w-5" />
              <span>MySklad Inventar - Batafsil Ko'rinish</span>
            </DialogTitle>
          </DialogHeader>
          
          {warehouseLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Ma'lumotlar yuklanmoqda...</span>
            </div>
          ) : warehouseData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-neutral-600">Jami Mahsulotlar</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {warehouseData.summary?.totalProducts || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-neutral-600">Jami Qoldiq</p>
                    <p className="text-2xl font-bold text-green-600">
                      {warehouseData.summary?.totalStock || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-neutral-600">Sebestoimost</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(warehouseData.summary?.totalValue || 0).toLocaleString()} so'm
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-neutral-600">Sizning Foydangiz</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {(warehouseData.summary?.totalProfit || 0).toLocaleString()} so'm
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Mahsulotlar Tafsiloti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nomi</th>
                          <th className="text-left p-2">Rasm</th>
                          <th className="text-left p-2">Qoldiq</th>
                          <th className="text-left p-2">Sebestoimost</th>
                          <th className="text-left p-2">Jami Qiymat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouseData.products?.map((product: any) => (
                          <tr key={product.id} className="border-b hover:bg-neutral-50">
                            <td className="p-2 font-medium">{product.name}</td>
                            <td className="p-2">
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
                            </td>
                            <td className="p-2">
                              <Badge variant={product.currentStock <= 5 ? "destructive" : "secondary"}>
                                {product.currentStock} dona
                              </Badge>
                            </td>
                            <td className="p-2">
                              {product.costPrice?.toLocaleString() || 0} so'm
                            </td>
                            <td className="p-2 font-semibold text-green-600">
                              {product.stockValue?.toLocaleString() || 0} so'm
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
    </div>
  );
}