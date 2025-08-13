import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, Star, Calculator, DollarSign } from "lucide-react";

interface FulfillmentResult {
  tier: number;
  fixedFee: number;
  bonusFee: number;
  totalFee: number;
  netProfit: number;
  bonusPercentage: number;
  nextThreshold: number | null;
  thresholdMet: boolean;
}

interface FulfillmentCalculatorProps {
  className?: string;
}

export function FulfillmentCalculator({ className }: FulfillmentCalculatorProps) {
  const [selectedTier, setSelectedTier] = useState<string>("1");
  const [salesInput, setSalesInput] = useState<string>("20,000,000");
  const [netProfitInput, setNetProfitInput] = useState<string>("3,000,000");
  const [result, setResult] = useState<FulfillmentResult | null>(null);

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

  const handleNetProfitInputChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setNetProfitInput(formatted);
  };

  // Calculate fulfillment fees based on corrected tier system
  const calculateFulfillmentFees = (tier: number, sales: number, netProfit: number): FulfillmentResult => {
    let fixedFee = 0;
    let bonusFee = 0;
    let bonusPercentage = 0;
    let nextThreshold: number | null = null;
    let thresholdMet = false;

    switch (tier) {
      case 1: // Tier 1: 2.5M fiksa
        fixedFee = 2500000;
        nextThreshold = 15000000;
        
        if (sales >= 15000000) {
          thresholdMet = true;
          if (sales <= 45000000) {
            bonusPercentage = 12;
            nextThreshold = 45000000;
          } else if (sales <= 90000000) {
            bonusPercentage = 15;
            nextThreshold = 90000000;
          } else if (sales <= 180000000) {
            bonusPercentage = 20;
            nextThreshold = 180000000;
          } else {
            bonusPercentage = 23;
            nextThreshold = null;
          }
          bonusFee = netProfit * (bonusPercentage / 100);
        }
        break;

      case 2: // Tier 2: 4.5M fiksa
        fixedFee = 4500000;
        nextThreshold = 45000000;
        
        if (sales >= 45000000) {
          thresholdMet = true;
          if (sales <= 80000000) {
            bonusPercentage = 12;
            nextThreshold = 80000000;
          } else if (sales <= 150000000) {
            bonusPercentage = 15;
            nextThreshold = 150000000;
          } else if (sales <= 250000000) {
            bonusPercentage = 20;
            nextThreshold = 250000000;
          } else {
            bonusPercentage = 23;
            nextThreshold = null;
          }
          bonusFee = netProfit * (bonusPercentage / 100);
        }
        break;

      case 3: // Tier 3: 6.5M fiksa
        fixedFee = 6500000;
        nextThreshold = 80000000;
        
        if (sales >= 80000000) {
          thresholdMet = true;
          if (sales <= 150000000) {
            bonusPercentage = 12;
            nextThreshold = 150000000;
          } else if (sales <= 250000000) {
            bonusPercentage = 15;
            nextThreshold = 250000000;
          } else if (sales <= 350000000) {
            bonusPercentage = 20;
            nextThreshold = 350000000;
          } else {
            bonusPercentage = 23;
            nextThreshold = null;
          }
          bonusFee = netProfit * (bonusPercentage / 100);
        }
        break;
    }

    const totalFee = fixedFee + bonusFee;
    const remainingProfit = netProfit - totalFee; // Fiksa ham bonusni ham ayirish kerak!

    return {
      tier,
      fixedFee,
      bonusFee,
      totalFee,
      netProfit: remainingProfit,
      bonusPercentage,
      nextThreshold,
      thresholdMet
    };
  };

  useEffect(() => {
    const sales = parseNumberInput(salesInput);
    const netProfit = parseNumberInput(netProfitInput);
    const tier = parseInt(selectedTier);
    const calculatedResult = calculateFulfillmentFees(tier, sales, netProfit);
    setResult(calculatedResult);
  }, [selectedTier, salesInput, netProfitInput]);

  const formatSom = (amount: number): string => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 1:
        return {
          name: 'Tier 1 - Boshlang\'ich',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Target className="h-4 w-4" />,
          description: '2.5M so\'m fiksa + 15M so\'mdan bonus (sof foydadan)',
          fixedFee: '2,500,000 so\'m',
          threshold: '15,000,000 so\'m'
        };
      case 2:
        return {
          name: 'Tier 2 - Professional',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <TrendingUp className="h-4 w-4" />,
          description: '4.5M so\'m fiksa + 45M so\'mdan bonus (sof foydadan)',
          fixedFee: '4,500,000 so\'m',
          threshold: '45,000,000 so\'m'
        };
      case 3:
        return {
          name: 'Tier 3 - Premium',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          icon: <Star className="h-4 w-4" />,
          description: '6.5M so\'m fiksa + 80M so\'mdan bonus (sof foydadan)',
          fixedFee: '6,500,000 so\'m',
          threshold: '80,000,000 so\'m'
        };
      default:
        return {
          name: 'Tier 1 - Boshlang\'ich',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Target className="h-4 w-4" />,
          description: '2.5M so\'m fiksa + 15M so\'mdan bonus (sof foydadan)',
          fixedFee: '2,500,000 so\'m',
          threshold: '15,000,000 so\'m'
        };
    }
  };

  const sales = parseNumberInput(salesInput);
  const tierInfo = getTierInfo(parseInt(selectedTier));
  
  // Calculate progress to next threshold
  const progressToNext = result?.nextThreshold 
    ? Math.min((sales / result.nextThreshold) * 100, 100)
    : 100;

  return (
    <Card className={className} data-testid="fulfillment-calculator">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Fulfillment Xizmat Haqqi Kalkulyatori
        </CardTitle>
        <CardDescription>
          Tadbirkor tomonidan fulfilmentga to'lanishi kerak bo'lgan xizmat haqqini hisoblang
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tier Selection */}
        <div className="space-y-2">
          <Label htmlFor="tier-select" className="text-sm font-medium">
            Tarif Tanlang (Tadbirkor o'zi tanlaydi)
          </Label>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger data-testid="select-tier">
              <SelectValue placeholder="Tarifni tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tier 1 - Boshlang'ich (2.5M fiksa)</SelectItem>
              <SelectItem value="2">Tier 2 - Professional (4.5M fiksa)</SelectItem>
              <SelectItem value="3">Tier 3 - Premium (6.5M fiksa)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Tier Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={tierInfo.color}>
              {tierInfo.icon}
              <span className="ml-1">{tierInfo.name}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Fiksa to'lov:</span>
              <div className="font-medium">{tierInfo.fixedFee}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Bonus chegarasi:</span>
              <div className="font-medium">{tierInfo.threshold}</div>
            </div>
          </div>
        </div>

        {/* Sales Input */}
        <div className="space-y-2">
          <Label htmlFor="sales-input" className="text-sm font-medium">
            Oylik Savdo Hajmi (so'm)
          </Label>
          <Input
            id="sales-input"
            type="text"
            value={salesInput}
            onChange={(e) => handleSalesInputChange(e.target.value)}
            placeholder="20,000,000"
            className="text-lg font-mono"
            data-testid="input-sales-amount"
          />
        </div>

        {/* Net Profit Input */}
        <div className="space-y-2">
          <Label htmlFor="net-profit-input" className="text-sm font-medium">
            Sof Foyda (so'm)
          </Label>
          <Input
            id="net-profit-input"
            type="text"
            value={netProfitInput}
            onChange={(e) => handleNetProfitInputChange(e.target.value)}
            placeholder="3,000,000"
            className="text-lg font-mono"
            data-testid="input-net-profit"
          />
        </div>

        {result && (
          <>
            {/* Progress to Next Threshold */}
            {result.nextThreshold && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Keyingi chegara uchun:</span>
                  <span className="font-medium">
                    {formatSom(result.nextThreshold)}
                  </span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Qolgan: {formatSom(Math.max(0, result.nextThreshold - sales))}
                </p>
              </div>
            )}

            <Separator />

            {/* Payment Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Fulfilmentga To'lov Tafsilotlari:</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fiksa to'lov:</span>
                  <span className="font-medium">{formatSom(result.fixedFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bonus to'lov ({result.bonusPercentage}% sof foydadan):
                  </span>
                  <span className="font-medium">{formatSom(result.bonusFee)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-600">Jami Fulfilment Haqqi:</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatSom(result.totalFee)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">Tadbirkor uchun Qolgan Foyda:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatSom(result.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {!result.thresholdMet && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  💡 Bonus sistema ishlamaydi: {formatSom(result.nextThreshold || 0)} dan yuqori 
                  savdo qilsangiz bonus sistema ishga tushadi!
                </p>
              </div>
            )}

            {result.thresholdMet && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🎉 Bonus sistema faol! Siz savdo chegarasini bajardingiz va 
                  {result.bonusPercentage}% sof foydadan qo'shimcha to'lov berasiz.
                </p>
              </div>
            )}

            {/* Profit Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Foyda Tahlili:</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Umumiy Sof Foyda:</span>
                  <div className="font-medium">{formatSom(parseNumberInput(netProfitInput))}</div>
                </div>
                <div>
                  <span className="text-blue-700">Fulfilmentga To'lov:</span>
                  <div className="font-medium text-red-600">{formatSom(result.totalFee)}</div>
                </div>
                <div>
                  <span className="text-blue-700">Sizga Qoladi:</span>
                  <div className="font-medium text-green-600">{formatSom(result.netProfit)}</div>
                </div>
                <div>
                  <span className="text-blue-700">Foiz Ulushi:</span>
                  <div className="font-medium">
                    {parseNumberInput(netProfitInput) > 0 
                      ? Math.round((result.totalFee / parseNumberInput(netProfitInput)) * 100) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}