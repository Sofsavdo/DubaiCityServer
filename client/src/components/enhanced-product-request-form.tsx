import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, Package, Truck } from "lucide-react";

export function EnhancedProductRequestForm() {
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
    mutationFn: async (data: any) => {
      return apiRequest("/api/product-requests", "POST", {
        ...data,
        expectedQuantity: parseInt(data.expectedQuantity),
        estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "So'rov yuborildi",
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
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "So'rov yuborishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.expectedQuantity) {
      toast({
        title: "Ma'lumot yetishmaydi",
        description: "Mahsulot nomi va miqdorni kiriting",
        variant: "destructive",
      });
      return;
    }
    createRequestMutation.mutate(formData);
  };

  const urgencyColors = {
    low: "bg-blue-100 text-blue-800",
    normal: "bg-green-100 text-green-800", 
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <Card data-testid="card-enhanced-product-request">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Mahsulot So'rovi Yuborish
        </CardTitle>
        <CardDescription>
          Admin so'rovni ko'rib chiqib, kerak bo'lsa tahrirlaydi va tasdiqlaydi. Tasdiqlangan mahsulotlar MySklad'ga qo'shiladi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Workflow Tushuntirish</h4>
              <p className="text-blue-700 text-sm mt-1">
                1️⃣ Siz mahsulot ma'lumotlarini to'liq kiritasiz<br />
                2️⃣ Admin so'rovni ko'radi va kerak bo'lsa tahrirlaydi<br />
                3️⃣ Admin tasdiqlashi bilan MySklad'ga qo'shiladi<br />
                4️⃣ Uzum/Yandex Market orqali avtomatik savdo boshlanadi
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Mahsulot Nomi *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Masalan: iPhone 15 Pro Max 256GB"
                required
                data-testid="input-product-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedQuantity">Kutilayotgan Miqdor *</Label>
              <Input
                id="expectedQuantity"
                type="number"
                value={formData.expectedQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedQuantity: e.target.value }))}
                placeholder="100"
                min="1"
                required
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
                placeholder="15000000"
                min="0"
                step="1000"
                data-testid="input-estimated-price"
              />
              <p className="text-xs text-neutral-500">Birlik uchun taxminiy narx</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgencyLevel">Muhimlik Darajasi</Label>
              <Select
                value={formData.urgencyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}
              >
                <SelectTrigger data-testid="select-urgency-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyColors.low}>Past</Badge>
                      <span>1-2 hafta ichida</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyColors.normal}>Oddiy</Badge>
                      <span>Bu haftada</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyColors.high}>Yuqori</Badge>
                      <span>2-3 kun ichida</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyColors.urgent}>Shoshilinch</Badge>
                      <span>Bugun-ertaga</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierInfo" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Ta'minotchi Ma'lumotlari
            </Label>
            <Textarea
              id="supplierInfo"
              value={formData.supplierInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierInfo: e.target.value }))}
              placeholder="Qayerdan olib kelasiz? Masalan: Toshkent do'koni, Xitoydan buyurtma, mahalliy ishlab chiqarish..."
              data-testid="textarea-supplier-info"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Batafsil Tavsif</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mahsulot haqida batafsil: rang, o'lcham, model, xususiyatlari va h.k."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Muhim Eslatma</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Admin sizning so'rovingizni ko'rib chiqib, agar kerak bo'lsa miqdor yoki narxni o'zgartirishi mumkin.
                  Masalan: 10 ta qizil qalam so'rov qildingiz, lekin 9 ta oq qalam olib keldingiz.
                  Admin buni to'g'rilab, haqiqiy holatni MySklad'ga kiritadi.
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createRequestMutation.isPending}
            data-testid="button-submit-enhanced-request"
          >
            {createRequestMutation.isPending ? 'Yuborilmoqda...' : 'So\'rov Yuborish'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}