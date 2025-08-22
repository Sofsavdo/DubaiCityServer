import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ProductRequestFormProps {
  onSuccess?: () => void;
}

export function ProductRequestForm({ onSuccess }: ProductRequestFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    expectedQuantity: "",
    estimatedPrice: "",
    supplierInfo: "",
    urgencyLevel: "normal",
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/product-requests", "POST", {
        productName: data.productName,
        description: data.description,
        expectedQuantity: parseInt(data.expectedQuantity) || 1,
        estimatedPrice: parseFloat(data.estimatedPrice) || 0,
        supplierInfo: data.supplierInfo,
        urgencyLevel: data.urgencyLevel,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot so'rovi muvaffaqiyatli yuborildi. Admin ko'rib chiqadi.",
      });
      setFormData({
        productName: "",
        description: "",
        expectedQuantity: "",
        estimatedPrice: "",
        supplierInfo: "",
        urgencyLevel: "normal",
      });
      onSuccess?.();
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
        title: "Xatolik",
        description: "So'rov yuborishda xatolik yuz berdi. Qayta urinib ko'ring.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      toast({
        title: "Xatolik",
        description: "Mahsulot nomini kiriting",
        variant: "destructive",
      });
      return;
    }
    createRequestMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Yangi Mahsulot So'rovi
        </CardTitle>
        <CardDescription>
          Katalogga qo'shmoqchi bo'lgan mahsulot haqida ma'lumot bering
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Mahsulot Nomi *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Masalan: Xiaomi Redmi Note 12"
                required
                data-testid="input-product-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedQuantity">Kutilgan Miqdor</Label>
              <Input
                id="expectedQuantity"
                type="number"
                value={formData.expectedQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedQuantity: e.target.value }))}
                placeholder="Nechta olib kelmoqchisiz?"
                min="1"
                data-testid="input-expected-quantity"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedPrice">Taxminiy Narx (so'm)</Label>
              <Input
                id="estimatedPrice"
                type="number"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                placeholder="Donasi qancha turadi?"
                min="0"
                step="0.01"
                data-testid="input-estimated-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel">Shoshilish Darajasi</Label>
              <select
                id="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                data-testid="select-urgency-level"
              >
                <option value="low">Past - 1-2 hafta</option>
                <option value="normal">O'rtacha - 3-5 kun</option>
                <option value="high">Yuqori - 1-2 kun</option>
                <option value="urgent">Shoshilinch - Bugun</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mahsulot Tavsifi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mahsulot haqida batafsil ma'lumot, xususiyatlari, rangi, o'lchami va boshqalar..."
              className="min-h-[100px]"
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierInfo">Ta'minotchi Ma'lumoti (ixtiyoriy)</Label>
            <Input
              id="supplierInfo"
              value={formData.supplierInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierInfo: e.target.value }))}
              placeholder="Qayerdan olib kelmoqchisiz? Havola yoki ma'lumot..."
              data-testid="input-supplier-info"
            />
          </div>

          <Button 
            type="submit" 
            disabled={createRequestMutation.isPending}
            className="w-full"
            data-testid="button-submit-request"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createRequestMutation.isPending ? "Yuborilmoqda..." : "So'rov Yuborish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}