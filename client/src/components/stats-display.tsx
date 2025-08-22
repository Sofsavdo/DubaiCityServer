import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Package, ShoppingCart, DollarSign, Users, AlertCircle, Target, Star } from "lucide-react";

interface PartnerStats {
  totalOrders: number;
  activeProducts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  commission: number;
}

interface AdminStats {
  totalPartners: number;
  pendingRequests: number;
  totalRevenue: number;
  totalOrders: number;
}

interface StatsDisplayProps {
  stats: PartnerStats | AdminStats;
  type: 'partner' | 'admin';
  className?: string;
}

export function StatsDisplay({ stats, type, className }: StatsDisplayProps) {
  // Handle undefined stats with default values
  if (!stats) {
    stats = type === 'admin' 
      ? { totalPartners: 0, pendingRequests: 0, totalRevenue: 0, totalOrders: 0 }
      : { totalOrders: 0, activeProducts: 0, totalRevenue: 0, monthlyRevenue: 0, commission: 0 };
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  // Determine tier for partner stats
  const getTier = (revenue: number) => {
    if (revenue >= 50000000) return { name: 'Premium', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Star };
    if (revenue >= 25000000) return { name: 'Professional', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: TrendingUp };
    return { name: 'Basic', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Target };
  };

  if (type === 'partner') {
    const partnerStats = stats as PartnerStats;
    const tier = getTier(partnerStats.totalRevenue);
    const TierIcon = tier.icon;

    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        <Card data-testid="card-total-orders">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-orders-count">
              {formatNumber(partnerStats.totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime orders processed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-products">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-products-count">
              {formatNumber(partnerStats.activeProducts)}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved products
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-revenue">
              {formatCurrency(partnerStats.totalRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={tier.color}>
                <TierIcon className="h-3 w-3 mr-1" />
                {tier.name}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-commission">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-commission">
              {formatCurrency(partnerStats.commission)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        {partnerStats.monthlyRevenue !== undefined && (
          <Card className="md:col-span-2" data-testid="card-monthly-revenue">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Performance</CardTitle>
              <CardDescription>Current month revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Revenue:</span>
                <span className="text-lg font-bold" data-testid="text-monthly-revenue">
                  {formatCurrency(partnerStats.monthlyRevenue)}
                </span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Base Payment:</span>
                  <p className="font-semibold">{formatCurrency(5500000)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Performance Bonus:</span>
                  <p className="font-semibold">
                    {formatCurrency(Math.max(0, partnerStats.commission - 5500000))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin stats display
  const adminStats = stats as AdminStats;
  
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <Card data-testid="card-total-partners">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-partners-count">
            {formatNumber(adminStats.totalPartners)}
          </div>
          <p className="text-xs text-muted-foreground">
            Active partner accounts
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-pending-requests">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-pending-count">
            {formatNumber(adminStats.pendingRequests)}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-platform-revenue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-platform-revenue">
            {formatCurrency(adminStats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total platform revenue
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-platform-orders">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-platform-orders">
            {formatNumber(adminStats.totalOrders)}
          </div>
          <p className="text-xs text-muted-foreground">
            Platform-wide orders
          </p>
        </CardContent>
      </Card>
    </div>
  );
}