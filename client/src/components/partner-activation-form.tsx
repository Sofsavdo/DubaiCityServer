import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PartnerActivationForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    inn: "",
    bankName: "",
    bankAccount: "",
    legalAddress: "",
    subscriptionTier: "",
    additionalInfo: "",
  });

  // Get existing legal info
  const { data: existingLegalInfo, isLoading: isLoadingLegalInfo } = useQuery({
    queryKey: ['/api/partner-legal-info'],
    retry: false,
  });

  const activationMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/partner-legal-info", data);
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat!",
        description: "Aktivatsiya so'rovingiz yuborildi. Admin tomonidan ko'rib chiqilgandan keyin, hisobingiz faollashtiriladi.",
      });
      // Refetch legal info
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Xatolik",
        description: "Aktivatsiya so'rovini yuborishda xatolik yuz berdi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activationMutation.mutate(formData);
  };

  // Show existing legal info status if available
  if (existingLegalInfo && Array.isArray(existingLegalInfo) && existingLegalInfo.length > 0) {
    const legalInfo = existingLegalInfo[0];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aktivatsiya Holati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Holat:</span>
              <Badge variant={
                legalInfo.activationStatus === 'pending' ? 'secondary' : 
                legalInfo.activationStatus === 'approved' ? 'default' : 'destructive'
              }>
                {legalInfo.activationStatus === 'pending' ? 'Kutilmoqda' : 
                 legalInfo.activationStatus === 'approved' ? 'Faollashtirilgan' : 'Rad etilgan'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p><strong>Kompaniya nomi:</strong> {legalInfo.companyName}</p>
              <p><strong>INN:</strong> {legalInfo.inn}</p>
              <p><strong>Bank:</strong> {legalInfo.bankName}</p>
              <p><strong>Hisob raqami:</strong> {legalInfo.bankAccount}</p>
              <p><strong>Obuna tarifi:</strong> {legalInfo.subscriptionTier}</p>
            </div>

            {legalInfo.activationStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Kutilmoqda</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Aktivatsiya so'rovingiz admin tomonidan ko'rib chiqilmoqda. Iltimos, biroz kuting.
                </p>
              </div>
            )}

            {legalInfo.activationStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Faollashtirilgan</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Hisobingiz muvaffaqiyatli faollashtirildi. Endi barcha xizmatlardan foydalanishingiz mumkin.
                </p>
              </div>
            )}

            {legalInfo.activationStatus === 'rejected' && legalInfo.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Rad etilgan</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  <strong>Sabab:</strong> {legalInfo.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Hisobni Faollashtirish
        </CardTitle>
        <p className="text-sm text-neutral-600">
          Hisobingizni to'liq faollashtirish uchun yuridik ma'lumotlar va obuna tarifini tanlang
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Kompaniya Ma'lumotlari
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Kompaniya nomi</Label>
                <Input
                  id="companyName"
                  data-testid="input-companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="'Biznes Kompaniya' MChJ"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="inn">INN raqami</Label>
                <Input
                  id="inn"
                  data-testid="input-inn"
                  type="text"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="123456789"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="legalAddress">Yuridik manzil</Label>
              <Input
                id="legalAddress"
                data-testid="input-legalAddress"
                type="text"
                value={formData.legalAddress}
                onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                placeholder="Toshkent sh., Yunusobod tumani, ..."
                required
              />
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Ma'lumotlari
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank nomi</Label>
                <Input
                  id="bankName"
                  data-testid="input-bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="'Ipoteka Bank' AKB"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bankAccount">Hisob raqami</Label>
                <Input
                  id="bankAccount"
                  data-testid="input-bankAccount"
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="22618000400010001001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Subscription Tier */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Obuna Tarifi
            </h3>
            
            <div>
              <Label htmlFor="subscriptionTier">Tarif tanlang</Label>
              <Select
                value={formData.subscriptionTier}
                onValueChange={(value) => setFormData({ ...formData, subscriptionTier: value })}
              >
                <SelectTrigger data-testid="select-subscriptionTier">
                  <SelectValue placeholder="Obuna tarifini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter_pro">🚀 Starter Pro - 0 so'm/oy (Risk-free)</SelectItem>
                  <SelectItem value="business_standard">💼 Business Standard - 3.5M so'm/oy</SelectItem>
                  <SelectItem value="professional_plus">⭐ Professional Plus - 6M so'm/oy</SelectItem>
                  <SelectItem value="enterprise_elite">👑 Enterprise Elite - 10M so'm/oy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Detailed Subscription Tier Information */}
            {formData.subscriptionTier && (
              <div className="space-y-4">
                {formData.subscriptionTier === 'starter_pro' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">🚀 Starter Pro - 0 so'm/oy (Risk-free)</h4>
                    <div className="text-sm text-green-800 space-y-2">
                      <div>
                        <strong>To'lov tizimi (Sof foydadan):</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• 0-5M sof foyda: 45% ulush</li>
                          <li>• 5-15M sof foyda: 40% ulush</li>
                          <li>• 15-30M sof foyda: 35% ulush</li>
                          <li>• 30M+ sof foyda: 30% ulush</li>
                          <li>• SPT xarajati: 2,000 so'm/dona</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Xizmatlar:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• 2 oylik BEPUL sinov</li>
                          <li>• Shaxsiy onboarding menejer</li>
                          <li>• Haftalik performance hisobot</li>
                          <li>• 25 mahsulot so'rovi/oy</li>
                          <li>• Har 10 buyurtmada 1 ta BEPUL SPT</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {formData.subscriptionTier === 'business_standard' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">💼 Business Standard - 3.5M so'm/oy</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <div>
                        <strong>To'lov tizimi (Sof foydadan):</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• 0-10M sof foyda: 25% ulush</li>
                          <li>• 10-25M sof foyda: 22% ulush</li>
                          <li>• 25-50M sof foyda: 20% ulush</li>
                          <li>• 50M+ sof foyda: 18% ulush</li>
                          <li>• SPT xarajati: 2,000 so'm/dona</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Xizmatlar:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• API kirish</li>
                          <li>• Oylik strategic review</li>
                          <li>• Marketing support (templates)</li>
                          <li>• 100 mahsulot so'rovi/oy</li>
                          <li>• Priority chat support</li>
                          <li>• Inventory forecasting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {formData.subscriptionTier === 'professional_plus' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-3">⭐ Professional Plus - 6M so'm/oy</h4>
                    <div className="text-sm text-purple-800 space-y-2">
                      <div>
                        <strong>To'lov tizimi (Sof foydadan):</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• 0-15M sof foyda: 20% ulush</li>
                          <li>• 15-35M sof foyda: 18% ulush</li>
                          <li>• 35-70M sof foyda: 16% ulush</li>
                          <li>• 70M+ sof foyda: 15% ulush</li>
                          <li>• SPT xarajati: 2,000 so'm/dona</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Xizmatlar:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Dedicated account manager</li>
                          <li>• Custom dashboard</li>
                          <li>• Advanced analytics</li>
                          <li>• Priority fulfillment queue</li>
                          <li>• Cheksiz mahsulot so'rovi</li>
                          <li>• 24/7 priority support</li>
                          <li>• White-label reporting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {formData.subscriptionTier === 'enterprise_elite' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-3">👑 Enterprise Elite - 10M so'm/oy</h4>
                    <div className="text-sm text-amber-800 space-y-2">
                      <div>
                        <strong>To'lov tizimi (Sof foydadan):</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• 0-25M sof foyda: 18% ulush</li>
                          <li>• 25-50M sof foyda: 16% ulush</li>
                          <li>• 50-100M sof foyda: 14% ulush</li>
                          <li>• 100M+ sof foyda: 12% ulush</li>
                          <li>• SPT xarajati: 2,000 so'm/dona</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Xizmatlar:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• C-level executive access</li>
                          <li>• Custom API integrations</li>
                          <li>• Real-time profit optimization</li>
                          <li>• Exclusive market insights</li>
                          <li>• Custom packaging options</li>
                          <li>• Priority fulfillment queue</li>
                          <li>• Dedicated team assigned</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Tariff Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">🚀 Yangi Professional Tarif Tizimi:</h4>
              <div className="text-sm text-neutral-700 space-y-1">
                <p><strong>Starter Pro (0 so'm):</strong> Risk-free boshlash, 2 oylik sinov, shaxsiy menejer</p>
                <p><strong>Business Standard (3.5M):</strong> Kichik biznes uchun, API va marketing support</p>
                <p><strong>Professional Plus (6M):</strong> O'rta biznes uchun, custom dashboard va menejer</p>
                <p><strong>Enterprise Elite (10M):</strong> Yirik biznes uchun, executive access va VIP xizmat</p>
                <p className="text-green-600 font-medium mt-2">✅ Barcha komissiyalar SOF FOYDADAN olinadi (real xarajatlardan keyin)</p>
                <p className="text-blue-600 font-medium">✅ SPT xarajati barcha tariflarda 2,000 so'm/dona (real tannarx)</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Qo'shimcha ma'lumot (ixtiyoriy)</Label>
            <Textarea
              id="additionalInfo"
              data-testid="textarea-additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Biznes haqida qo'shimcha ma'lumotlar..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={activationMutation.isPending}
            data-testid="button-submit"
          >
            {activationMutation.isPending ? "Yuborilmoqda..." : "Aktivatsiya So'rovini Yuborish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}