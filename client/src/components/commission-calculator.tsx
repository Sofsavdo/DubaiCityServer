import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Star, Calculator } from "lucide-react";

interface CommissionResult {
  tier: number;
  fixedPayment: number;
  bonusPayment: number;
  totalPayment: number;
  salesThreshold: number;
  bonusPercentage: number;
  nextTierAt: number | null;
}

interface CommissionCalculatorProps {
  className?: string;
}

export function CommissionCalculator({ className }: CommissionCalculatorProps) {
  const [salesInput, setSalesInput] = useState<string>("10,000,000");
  const [result, setResult] = useState<CommissionResult | null>(null);

  // Format number input with commas and handle som currency
  const formatNumberInput = (value: string): string => {
    // Remove non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Remove leading zeros but keep at least one digit
    const cleanNumbers = numbers.replace(/^0+/, '') || '0';
    
    // Add commas for thousands separator
    return cleanNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumberInput = (value: string): number => {
    return parseInt(value.replace(/,/g, '') || '0', 10);
  };

  const handleInputChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setSalesInput(formatted);
  };

  // Calculate commission based on corrected 3-tier system
  const calculateCommission = (sales: number): CommissionResult => {
    // Tier 1: 2.5M som fixed + 15M som threshold for bonus
    if (sales < 15000000) {
      return {
        tier: 1,
        fixedPayment: 2500000,
        bonusPayment: 0,
        totalPayment: 2500000,
        salesThreshold: 15000000,
        bonusPercentage: 0,
        nextTierAt: 15000000,
      };
    }
    
    // Tier 1 with bonus: 15M+ sales
    if (sales >= 15000000 && sales < 50000000) {
      const bonus = (sales - 15000000) * 0.15;
      return {
        tier: 1,
        fixedPayment: 2500000,
        bonusPayment: bonus,
        totalPayment: 2500000 + bonus,
        salesThreshold: 15000000,
        bonusPercentage: 15,
        nextTierAt: 50000000,
      };
    }
    
    // Tier 2: 4.5M som fixed + 50M som threshold for bonus
    if (sales >= 50000000 && sales < 80000000) {
      const bonus = (sales - 50000000) * 0.20;
      return {
        tier: 2,
        fixedPayment: 4500000,
        bonusPayment: bonus,
        totalPayment: 4500000 + bonus,
        salesThreshold: 50000000,
        bonusPercentage: 20,
        nextTierAt: 80000000,
      };
    }
    
    // Tier 3: 6M som fixed + 80M som threshold for bonus
    if (sales >= 80000000) {
      const bonus = (sales - 80000000) * 0.25;
      return {
        tier: 3,
        fixedPayment: 6000000,
        bonusPayment: bonus,
        totalPayment: 6000000 + bonus,
        salesThreshold: 80000000,
        bonusPercentage: 25,
        nextTierAt: null,
      };
    }
    
    // Default fallback
    return {
      tier: 1,
      fixedPayment: 2500000,
      bonusPayment: 0,
      totalPayment: 2500000,
      salesThreshold: 15000000,
      bonusPercentage: 0,
      nextTierAt: 15000000,
    };
  };

  useEffect(() => {
    const sales = parseNumberInput(salesInput);
    const calculatedResult = calculateCommission(sales);
    setResult(calculatedResult);
  }, [salesInput]);

  const formatSom = (amount: number): string => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 1:
        return {
          name: 'Tier 1',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Target className="h-4 w-4" />,
          description: '2.5M so\'m fiksa + 15M so\'mdan bonus'
        };
      case 2:
        return {
          name: 'Tier 2',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <TrendingUp className="h-4 w-4" />,
          description: '4.5M so\'m fiksa + 50M so\'mdan bonus'
        };
      case 3:
        return {
          name: 'Tier 3',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          icon: <Star className="h-4 w-4" />,
          description: '6M so\'m fiksa + 80M so\'mdan bonus'
        };
      default:
        return {
          name: 'Tier 1',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Target className="h-4 w-4" />,
          description: '2.5M so\'m fiksa + 15M so\'mdan bonus'
        };
    }
  };

  const sales = parseNumberInput(salesInput);
  const tierInfo = result ? getTierInfo(result.tier) : getTierInfo(1);
  
  // Calculate progress to next tier
  const progressToNext = result?.nextTierAt 
    ? Math.min((sales / result.nextTierAt) * 100, 100)
    : 100;

  return (
    <Card className={className} data-testid="commission-calculator">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Komissiya Kalkulyatori
        </CardTitle>
        <CardDescription>
          Oylik savdo hajmingizni kiriting va to'lov miqdorini hisoblang
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sales Input */}
        <div className="space-y-2">
          <Label htmlFor="sales-input" className="text-sm font-medium">
            Oylik Savdo Hajmi (so'm)
          </Label>
          <Input
            id="sales-input"
            type="text"
            value={salesInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="10,000,000"
            className="text-lg font-mono"
            data-testid="input-sales-amount"
          />
        </div>

        {result && (
          <>
            {/* Current Tier */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Joriy Tier:</span>
                <Badge className={tierInfo.color}>
                  {tierInfo.icon}
                  <span className="ml-1">{tierInfo.name}</span>
                </Badge>
              </div>
            </div>

            {/* Tier Description */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
            </div>

            {/* Progress to Next Tier */}
            {result.nextTierAt && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Keyingi Tier uchun:</span>
                  <span className="font-medium">
                    {formatSom(result.nextTierAt)}
                  </span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Qolgan: {formatSom(Math.max(0, result.nextTierAt - sales))}
                </p>
              </div>
            )}

            <Separator />

            {/* Payment Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">To'lov Tafsilotlari:</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fiksatsiyalangan to'lov:</span>
                  <span className="font-medium">{formatSom(result.fixedPayment)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bonus to'lov ({result.bonusPercentage}%):
                  </span>
                  <span className="font-medium">{formatSom(result.bonusPayment)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Jami to'lov:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatSom(result.totalPayment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bonus System Explanation */}
            {result.bonusPayment === 0 && sales < result.salesThreshold && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  💡 Bonus sistema ishlamaydi: {formatSom(result.salesThreshold)} dan yuqori 
                  savdo qilsangiz bonus olasiz!
                </p>
              </div>
            )}

            {result.bonusPayment > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  🎉 Bonus sistema faol! Siz {formatSom(result.salesThreshold)} dan yuqori 
                  savdo qildingiz va {result.bonusPercentage}% bonus olasiz.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}