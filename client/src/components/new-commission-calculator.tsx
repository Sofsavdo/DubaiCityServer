import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, Target, DollarSign, Zap, Crown } from "lucide-react";
import { PRICING_TIERS, calculateCommission, getTotalFulfillmentFee, type PricingTier } from "@shared/schema";

interface CommissionResult {
  tier: PricingTier;
  tierName: string;
  fixedPayment: number;
  commissionRate: number;
  commissionAmount: number;
  totalFee: number;
  partnerProfit: number;
  profitPercentage: number;
}

interface NewCommissionCalculatorProps {
  className?: string;
}

export function NewCommissionCalculator({ className }: NewCommissionCalculatorProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier>("basic");
  const [salesInput, setSalesInput] = useState<string>("20,000,000");
  const [costInput, setCostInput] = useState<string>("12,000,000");
  const [quantityInput, setQuantityInput] = useState<string>("1");
  const [result, setResult] = useState<CommissionResult | null>(null);

  // Format number input with commas
  const formatNumberInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const cleanNumbers = numbers.replace(/^0+/, '') || '0';
    return cleanNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumberInput = (value: string): number => {
    return parseInt(value.replace(/,/g, '') || '0', 10);
  };

  const handleSalesInputChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setSalesInput(formatted);
  };

  const handleCostInputChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setCostInput(formatted);
  };

  // Calculate new commission structure with quantity-based SPT
  const calculateNewCommission = (sales: number, cost: number, quantity: number, tier: PricingTier): CommissionResult => {
    const tierConfig = PRICING_TIERS[tier];
    const sptCost = tierConfig.sptCost * quantity; // 2,000 som per item
    const taxRate = 0.03;
    
    // Net profit calculation: Sales - Cost - (SPT * quantity) - 3% Tax
    const beforeTax = sales - cost - sptCost;
    const tax = beforeTax * taxRate;
    const netProfit = beforeTax - tax;
    
    // Get commission based on net profit
    const commission = calculateCommission(netProfit, tier);
    const totalFee = tierConfig.fixedPayment + commission.amount;
    
    // Partner final profit: Net profit - fulfillment fee
    const partnerProfit = netProfit - totalFee;
    const profitPercentage = sales > 0 ? (partnerProfit / sales) * 100 : 0;

    return {
      tier,
      tierName: tierConfig.name,
      fixedPayment: tierConfig.fixedPayment,
      commissionRate: commission.rate,
      commissionAmount: commission.amount,
      totalFee,
      partnerProfit,
      profitPercentage
    };
  };

  useEffect(() => {
    const sales = parseNumberInput(salesInput);
    const cost = parseNumberInput(costInput);
    const quantity = parseInt(quantityInput || '1', 10);
    const calculatedResult = calculateNewCommission(sales, cost, quantity, selectedTier);
    setResult(calculatedResult);
  }, [salesInput, costInput, quantityInput, selectedTier]);

  const formatSom = (amount: number): string => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ' so\'m';
  };

  const getTierIcon = (tier: PricingTier) => {
    switch (tier) {
      case 'basic': return <Zap className="h-4 w-4" />;
      case 'professional': return <Target className="h-4 w-4" />;
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: PricingTier) => {
    switch (tier) {
      case 'basic': return 'text-green-600';
      case 'professional': return 'text-blue-600';
      case 'enterprise': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Professional Komissiya Kalkulyatori
        </CardTitle>
        <CardDescription>
          Yangi 4-darajali professional tarif tizimi - sof foydadan komissiya
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Selection */}
        <div className="space-y-2">
          <Label htmlFor="tier-select" className="text-sm font-medium">
            Tarif tanlang
          </Label>
          <Select value={selectedTier} onValueChange={(value: PricingTier) => setSelectedTier(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tarif tanlang" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRICING_TIERS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {getTierIcon(key as PricingTier)}
                    <span className={getTierColor(key as PricingTier)}>{config.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sales" className="text-sm font-medium">
              Savdo miqdori (so'm)
            </Label>
            <Input
              id="sales"
              value={salesInput}
              onChange={(e) => handleSalesInputChange(e.target.value)}
              placeholder="20,000,000"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost" className="text-sm font-medium">
              Tannarxi (so'm)
            </Label>
            <Input
              id="cost"
              value={costInput}
              onChange={(e) => handleCostInputChange(e.target.value)}
              placeholder="12,000,000"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Miqdor (dona)
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="1"
              min="1"
              className="text-right"
            />
          </div>
        </div>

        {result && (
          <>
            <Separator />
            
            {/* Tier Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTierIcon(result.tier)}
                  <h3 className={`font-semibold ${getTierColor(result.tier)}`}>
                    {result.tierName}
                  </h3>
                </div>
                <Badge variant="outline">
                  Tarif {result.tier.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {PRICING_TIERS[result.tier].description}
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Hisob-kitob tafsiloti:</h4>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Savdo miqdori:</span>
                  <span className="font-semibold">{formatSom(parseNumberInput(salesInput))}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Tannarx:</span>
                  <span className="text-red-600">-{formatSom(parseNumberInput(costInput))}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Miqdor:</span>
                  <span className="font-medium">{quantityInput} dona</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>SPT xarajati ({quantityInput} × 2,000):</span>
                  <span className="text-red-600">-{formatSom(PRICING_TIERS[result.tier].sptCost * parseInt(quantityInput || '1', 10))}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>3% soliq:</span>
                  <span className="text-red-600">-{formatSom((parseNumberInput(salesInput) - parseNumberInput(costInput) - PRICING_TIERS[result.tier].sptCost * parseInt(quantityInput || '1', 10)) * 0.03)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b-2 border-gray-300 dark:border-gray-600">
                  <span className="font-semibold">Sof foyda:</span>
                  <span className="font-semibold text-green-600">
                    {formatSom(parseNumberInput(salesInput) - parseNumberInput(costInput) - PRICING_TIERS[result.tier].sptCost - (parseNumberInput(salesInput) - parseNumberInput(costInput) - PRICING_TIERS[result.tier].sptCost) * 0.03)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fulfillment Fee Breakdown */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Fulfillment xizmat haqqi:</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fiksa to'lov:</span>
                  <span className="font-semibold">{formatSom(result.fixedPayment)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Komissiya ({result.commissionRate}% sof foydadan):</span>
                  <span className="font-semibold">{formatSom(result.commissionAmount)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between text-base font-semibold">
                  <span>Jami fulfillment haqi:</span>
                  <span className="text-blue-600">{formatSom(result.totalFee)}</span>
                </div>
              </div>
            </div>

            {/* Partner Profit */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Hamkor foydasi:</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Final foyda:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatSom(result.partnerProfit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Foyda foizi:</span>
                  <Badge variant={result.profitPercentage >= 15 ? "default" : "secondary"}>
                    {result.profitPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {result.tierName} taririga ko'ra
                </p>
                <p className="text-lg font-semibold">
                  Hamkor {result.profitPercentage.toFixed(1)}% margin bilan <span className="text-green-600">{formatSom(result.partnerProfit)}</span> foyda oladi
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Fulfillment: to'liq professional xizmat (akkaunt boshqaruv, kontent, qadoqlash, mijozlar bilan aloqa)
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}