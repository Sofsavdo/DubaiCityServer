import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Store,
  Plus,
  Settings,
  TestTube,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  User
} from "lucide-react";
import { Link, useParams } from "wouter";
import { exportInventoryToExcel } from "@/utils/excelExport";
import type { MarketplaceIntegration, PartnerWithUser } from "@shared/schema";
import { getProductsByPartner } from "@/lib/api";

export default function AdminMarketplaceManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ partnerId: string }>();
  const partnerId = params.partnerId;
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    marketplace: "",
    storeName: "",
    apiKey: "",
    storeUrl: "",
    additionalConfig: "",
  });

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

  // Fetch partner info
  const { data: partner, isLoading: partnerLoading } = useQuery<PartnerWithUser | null>({
    queryKey: [`/api/admin/partners/${partnerId}`],
    enabled: !!partnerId && !!user && (user as any).role === 'admin',
  });

  // Fetch partner's marketplace integrations
  const { data: integrations = [], isLoading } = useQuery<MarketplaceIntegration[]>({
    queryKey: [`/api/admin/partners/${partnerId}/marketplace-integrations`],
    enabled: !!partnerId && !!user && (user as any).role === 'admin',
  });

  // Fetch partner products (internal sklad view)
  const { data: partnerProducts } = useQuery({
    queryKey: [`/api/products/partner/${partnerId}`],
    queryFn: async () => {
      const res = await getProductsByPartner(partnerId!);
      return res.products || [];
    },
    enabled: !!partnerId && !!user && (user as any).role === 'admin',
  });

  // Create integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (integration: typeof newIntegration) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/marketplace-integrations`, {
        ...integration,
        partnerId,
        additionalConfig: integration.additionalConfig ? JSON.parse(integration.additionalConfig) : {},
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Marketplace integratsiyasi yaratildi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partnerId}/marketplace-integrations`] });
      setIsCreateDialogOpen(false);
      setNewIntegration({
        marketplace: "",
        storeName: "",
        apiKey: "",
        storeUrl: "",
        additionalConfig: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "Integratsiyani yaratishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      return await apiRequest("DELETE", `/api/admin/marketplace-integrations/${integrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Integratsiya o'chirildi",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partnerId}/marketplace-integrations`] });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "Integratsiyani o'chirishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const res = await apiRequest("POST", `/api/admin/marketplace-integrations/${integrationId}/test-connection`);
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Test muvaffaqiyatli",
        description: `${data?.marketplace || "API"} ga bog'lanish muvaffaqiyatli`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partnerId}/marketplace-integrations`] });
    },
    onError: (error) => {
      toast({
        title: "Test xatosi",
        description: "API ga bog'lanishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleCreateIntegration = () => {
    if (!newIntegration.marketplace || !newIntegration.storeName || !newIntegration.apiKey) {
      toast({
        title: "Xato",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    createIntegrationMutation.mutate(newIntegration);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMarketplaceDisplay = (marketplace: string) => {
    switch (marketplace) {
      case "uzum_market":
        return "Uzum Market";
      case "yandex_market":
        return "Yandex Market";
      default:
        return marketplace;
    }
  };

  if (authLoading || partnerLoading) {
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
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Admin - Marketplace Boshqarish
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
        {/* Partner Info */}
        {partner && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={partner.user?.profileImageUrl || ""} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {partner.user?.firstName || partner.user?.email || 'Hamkor'}
                  </CardTitle>
                  <CardDescription>
                    {partner.businessName && `${partner.businessName} • `}
                    {partner.user?.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Marketplace Integratsiyalari</h2>
            <p className="text-muted-foreground">
              Hamkor uchun marketplace integratsiyalarini boshqaring
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!integrations || integrations.length === 0) return;
                for (const integ of integrations) {
                  try {
                    await testConnectionMutation.mutateAsync(integ.id);
                  } catch {}
                }
              }}
              data-testid="button-sync-all"
            >
              Hammasini sync qilish
            </Button>
            <Button
              variant="outline"
              onClick={() => exportInventoryToExcel((partnerProducts as any) || [])}
              data-testid="button-export-inventory"
            >
              Inventarni eksport qilish
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-integration">
                <Plus className="h-4 w-4 mr-2" />
                Yangi integratsiya
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yangi Marketplace Integratsiyasi</DialogTitle>
                <DialogDescription>
                  Hamkor uchun yangi marketplace integratsiyasini sozlang
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="marketplace">Marketplace</Label>
                  <Select 
                    value={newIntegration.marketplace} 
                    onValueChange={(value) => setNewIntegration({...newIntegration, marketplace: value})}
                  >
                    <SelectTrigger data-testid="select-marketplace">
                      <SelectValue placeholder="Marketplace tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uzum_market">Uzum Market</SelectItem>
                      <SelectItem value="yandex_market">Yandex Market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storeName">Do'kon Nomi</Label>
                  <Input
                    id="storeName"
                    placeholder="Do'kon nomini kiriting"
                    value={newIntegration.storeName}
                    onChange={(e) => setNewIntegration({...newIntegration, storeName: e.target.value})}
                    data-testid="input-store-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="API kalitini kiriting"
                    value={newIntegration.apiKey}
                    onChange={(e) => setNewIntegration({...newIntegration, apiKey: e.target.value})}
                    data-testid="input-api-key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storeUrl">Do'kon URL (ixtiyoriy)</Label>
                  <Input
                    id="storeUrl"
                    placeholder="https://seller.uzum.uz/..."
                    value={newIntegration.storeUrl}
                    onChange={(e) => setNewIntegration({...newIntegration, storeUrl: e.target.value})}
                    data-testid="input-store-url"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="additionalConfig">Qo'shimcha Sozlamalar (JSON)</Label>
                  <Textarea
                    id="additionalConfig"
                    placeholder='{"warehouse_id": "123", "delivery_type": "standard"}'
                    value={newIntegration.additionalConfig}
                    onChange={(e) => setNewIntegration({...newIntegration, additionalConfig: e.target.value})}
                    data-testid="textarea-additional-config"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleCreateIntegration}
                  disabled={createIntegrationMutation.isPending}
                  data-testid="button-create-integration"
                >
                  {createIntegrationMutation.isPending ? "Yaratilmoqda..." : "Yaratish"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Store className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">
                Hech qanday integratsiya yo'q
              </h3>
              <p className="text-neutral-500 mb-4">
                Bu hamkor uchun hali marketplace integratsiyasi yaratilmagan
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration: MarketplaceIntegration) => (
              <Card key={integration.id} className="relative" data-testid={`card-integration-${integration.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getMarketplaceDisplay(integration.marketplace)}
                    </CardTitle>
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {integration.isActive ? "Faol" : "Faol emas"}
                    </Badge>
                  </div>
                  <CardDescription>{integration.storeName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Holat:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(integration.lastSyncStatus || "pending")}
                        <span className="capitalize">
                          {integration.lastSyncStatus === "success" ? "Muvaffaqiyatli" : 
                           integration.lastSyncStatus === "failed" ? "Xato" : "Kutilmoqda"}
                        </span>
                      </div>
                    </div>
                    {integration.lastSyncAt && (
                      <div className="text-sm text-neutral-600">
                        Oxirgi sync: {new Date(integration.lastSyncAt).toLocaleString("uz-UZ")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate(integration.id)}
                      disabled={testConnectionMutation.isPending}
                      data-testid={`button-test-${integration.id}`}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-settings-${integration.id}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                        disabled={deleteIntegrationMutation.isPending}
                        data-testid={`button-delete-${integration.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Internal sklad section for the partner */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Hamkorning ombori (ichki sklad)</CardTitle>
              <CardDescription>Mahsulot qoldiqlari va holati</CardDescription>
            </CardHeader>
            <CardContent>
              {!partnerProducts || partnerProducts.length === 0 ? (
                <div className="text-sm text-neutral-600">Mahsulotlar topilmadi</div>
              ) : (
                <div className="space-y-3">
                  {partnerProducts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-600">Stock: {p.stockQuantity} • Reserved: {p.reservedQuantity} • Sold: {p.soldQuantity}</div>
                      </div>
                      <Badge variant={p.stockQuantity <= (p.lowStockThreshold || 10) ? 'destructive' : 'secondary'}>
                        {p.stockQuantity <= (p.lowStockThreshold || 10) ? 'Kam qoldiq' : 'Normal'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}