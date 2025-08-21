import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText,
  User,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Generate unique contract number
const generateContractNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `MPP-${year}${month}${day}-${random}`;
};

interface PersonalInfoFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  
  // Business Info
  businessName: string;
  businessCategory: string;
  businessStructure: 'YaTT' | 'OOO' | '';
  investmentAmount: string;
  productQuantity: string;
  
  // Bank Details
  bankAccountNumber: string;
  bankName: string;
  mfoCode: string;
  okedCode: string;
  
  // Selected pricing tier
  pricingTier: 'basic' | 'professional' | 'enterprise';
  
  // Contract agreement
  contractAgreed: boolean;
  contractNumber: string;
}

export function PartnerContractSection() {
  const { toast } = useToast();
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    businessName: "",
    businessCategory: "",
    businessStructure: "",
    investmentAmount: "",
    productQuantity: "",
    bankAccountNumber: "",
    bankName: "",
    mfoCode: "",
    okedCode: "",
    pricingTier: 'basic',
    contractAgreed: false,
    contractNumber: generateContractNumber()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contractAgreed) {
      toast({
        title: "Diqqat!",
        description: "Shartnoma shartlariga rozilik berishingiz shart.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/partner-personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmissionStatus('success');
        toast({
          title: "Muvaffaqiyat!",
          description: "Shaxsiy ma'lumotlar saqlandi va aktivatsiya so'rovi yuborildi.",
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast({
        title: "Xatolik",
        description: "Shaxsiy ma'lumotlarni saqlashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success status if submitted
  if (submissionStatus === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shaxsiy Ma'lumotlar va Aktivatsiya Holati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Shartnoma Ma'lumotlari</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Shartnoma raqami: <span className="font-mono font-bold">{formData.contractNumber}</span>
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Aktivatsiya holati:</span>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Kutilmoqda
              </Badge>
            </div>

            {/* Selected Tier */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Tanlangan tarif:</span>
              <Badge variant="outline">
                {formData.pricingTier === 'basic' ? 'Boshlang\'ich (2.5M som/12%)' :
                 formData.pricingTier === 'professional' ? 'Professional (4.5M som/15%)' :
                 'Enterprise (6.5M som/18%)'}
              </Badge>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Biznes kategoriyasi</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.businessCategory}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Investitsiya miqdori</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.investmentAmount} so'm</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setContractModalOpen(true)}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Shartnomani Ko'rish
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shaxsiy Ma'lumotlar va Aktivatsiya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Number Display */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Shartnoma Raqami</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sizning shartnoma raqamingiz: <span className="font-mono font-bold">{formData.contractNumber}</span>
              </p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Shaxsiy Ma'lumotlar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ism</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Familiya</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon raqam</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+998 90 123 45 67"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Manzil</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="To'liq manzilingizni kiriting"
                  required
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Biznes Ma'lumotlari
              </h3>
              
              <div>
                <Label htmlFor="businessName">Biznes nomi</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Kompaniya yoki biznes nomini kiriting"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessCategory">Biznes kategoriyasi</Label>
                  <Select value={formData.businessCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, businessCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Biznes kategoriyasini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Elektronika</SelectItem>
                      <SelectItem value="fashion">Moda va kiyim</SelectItem>
                      <SelectItem value="home_garden">Uy va bog'</SelectItem>
                      <SelectItem value="sports">Sport va faoliyat</SelectItem>
                      <SelectItem value="beauty">Go'zallik va sog'liq</SelectItem>
                      <SelectItem value="books_media">Kitob va media</SelectItem>
                      <SelectItem value="toys_games">O'yinchoq va o'yinlar</SelectItem>
                      <SelectItem value="food_beverages">Oziq-ovqat va ichimliklar</SelectItem>
                      <SelectItem value="automotive">Avtomobil</SelectItem>
                      <SelectItem value="other">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="businessStructure">Biznes tuzilishi</Label>
                  <Select value={formData.businessStructure} onValueChange={(value: 'YaTT' | 'OOO') => setFormData(prev => ({ ...prev, businessStructure: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Biznes tuzilishini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YaTT">YaTT (Yakka tartibdagi tadbirkor)</SelectItem>
                      <SelectItem value="OOO">OOO (Mas'uliyati cheklangan jamiyat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investmentAmount">Investitsiya miqdori (so'm)</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentAmount: e.target.value }))}
                    placeholder="1000000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productQuantity">Mahsulotlar miqdori</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    value={formData.productQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, productQuantity: e.target.value }))}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Bank Ma'lumotlari
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountNumber">Hisob raqam</Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                      placeholder="20208000500123456789"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank nomi</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="Xalq Banki, NBU, Kapital Bank"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mfoCode">MFO kodi</Label>
                    <Input
                      id="mfoCode"
                      value={formData.mfoCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, mfoCode: e.target.value }))}
                      placeholder="00014"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="okedCode">OKED kodi</Label>
                    <Input
                      id="okedCode"
                      value={formData.okedCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, okedCode: e.target.value }))}
                      placeholder="52190"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Tier Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Tarif Rejani Tanlash
              </h3>
              
              <Select value={formData.pricingTier} onValueChange={(value: 'basic' | 'professional' | 'enterprise') => setFormData(prev => ({ ...prev, pricingTier: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    Boshlang'ich - 2.5M som/oy (12% komissiya)
                  </SelectItem>
                  <SelectItem value="professional">
                    Professional - 4.5M som/oy (15% komissiya)
                  </SelectItem>
                  <SelectItem value="enterprise">
                    Enterprise - 6.5M som/oy (18% komissiya)
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Pricing tier details */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm">
                {formData.pricingTier === 'basic' && (
                  <div>
                    <p className="font-semibold mb-2">Boshlang'ich tarif imkoniyatlari:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Oylik to'lov: 2.5 million so'm</li>
                      <li>Komissiya: 12%</li>
                      <li>Oyiga 10 ta mahsulot so'rovi</li>
                      <li>Asosiy hisobotlar</li>
                    </ul>
                  </div>
                )}
                {formData.pricingTier === 'professional' && (
                  <div>
                    <p className="font-semibold mb-2">Professional tarif imkoniyatlari:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Oylik to'lov: 4.5 million so'm</li>
                      <li>Komissiya: 15%</li>
                      <li>Oyiga 25 ta mahsulot so'rovi</li>
                      <li>Kengaytirilgan analitika</li>
                      <li>Ustuvor qo'llab-quvvatlash</li>
                    </ul>
                  </div>
                )}
                {formData.pricingTier === 'enterprise' && (
                  <div>
                    <p className="font-semibold mb-2">Enterprise tarif imkoniyatlari:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Oylik to'lov: 6.5 million so'm</li>
                      <li>Komissiya: 18%</li>
                      <li>Cheklanmagan mahsulot so'rovlari</li>
                      <li>To'liq analitika va hisobotlar</li>
                      <li>Shaxsiy integratsiyalar</li>
                      <li>24/7 qo'llab-quvvatlash</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Agreement */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Shartnoma Shartlari
              </h3>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="contractAgreed"
                  checked={formData.contractAgreed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contractAgreed: !!checked }))}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="contractAgreed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Shartnoma shartlariga roziman
                  </label>
                  <p className="text-xs text-muted-foreground">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() => setContractModalOpen(true)}
                    >
                      Shartnomani o'qish uchun bosing
                    </Button>
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.contractAgreed}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Yuborilmoqda..." : "Aktivatsiya So'rovi Yuborish"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contract Modal */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hamkorlik Shartnomasi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold">HAMKORLIK SHARTNOMASI</h2>
              <p className="text-gray-600">Shartnoma raqami: {formData.contractNumber}</p>
              <p className="text-gray-600">Sana: {new Date().toLocaleDateString('uz-UZ')}</p>
            </div>

            <div className="space-y-4">
              <section>
                <h3 className="font-semibold text-base mb-2">1. TOMONLAR</h3>
                <p><strong>Buyurtmachi:</strong> MarketPlace Pro platformasi</p>
                <p><strong>Ijrochi:</strong> Hamkor (tanlangan tarif bo'yicha)</p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. SHARTNOMA PREDMETI</h3>
                <p>Ushbu shartnoma MarketPlace Pro platformasida hamkorlik qilish shartlarini belgilaydi. Hamkor o'z mahsulotlarini platformada sotish huquqiga ega bo'ladi.</p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. TOMONLARNING MAJBURIYATLARI</h3>
                
                <h4 className="font-medium mt-3 mb-2">3.1. MarketPlace Pro majburiyatlari:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Platformada sifatli xizmat ko'rsatish</li>
                  <li>Buyurtmalarni o'z vaqtida yetkazib berish</li>
                  <li>Texnik qo'llab-quvvatlash</li>
                  <li>Marketing va reklama xizmatlari</li>
                  <li>MySklad tizimi orqali mahsulot boshqaruvi</li>
                </ul>

                <h4 className="font-medium mt-3 mb-2">3.2. Hamkor majburiyatlari:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Oylik to'lovni o'z vaqtida to'lash</li>
                  <li>Sifatli mahsulot taqdim etish</li>
                  <li>Mahsulot ma'lumotlarini to'g'ri kiritish</li>
                  <li>Mijozlar bilan sifatli aloqa</li>
                  <li>Platformaning qoidalariga rioya qilish</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. MOLIYAVIY SHARTLAR</h3>
                
                {formData.pricingTier === 'basic' && (
                  <div>
                    <p><strong>Tanlangan tarif:</strong> Boshlang'ich</p>
                    <p><strong>Oylik to'lov:</strong> 2,500,000 so'm</p>
                    <p><strong>Komissiya:</strong> 12%</p>
                    <p><strong>Qo'shimcha imkoniyatlar:</strong> Oyiga 10 ta mahsulot so'rovi, asosiy hisobotlar</p>
                  </div>
                )}
                {formData.pricingTier === 'professional' && (
                  <div>
                    <p><strong>Tanlangan tarif:</strong> Professional</p>
                    <p><strong>Oylik to'lov:</strong> 4,500,000 so'm</p>
                    <p><strong>Komissiya:</strong> 15%</p>
                    <p><strong>Qo'shimcha imkoniyatlar:</strong> Oyiga 25 ta mahsulot so'rovi, kengaytirilgan analitika</p>
                  </div>
                )}
                {formData.pricingTier === 'enterprise' && (
                  <div>
                    <p><strong>Tanlangan tarif:</strong> Enterprise</p>
                    <p><strong>Oylik to'lov:</strong> 6,500,000 so'm</p>
                    <p><strong>Komissiya:</strong> 18%</p>
                    <p><strong>Qo'shimcha imkoniyatlar:</strong> Cheklanmagan so'rovlar, to'liq analitika, 24/7 qo'llab-quvvatlash</p>
                  </div>
                )}

                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <p><strong>Muhim:</strong> Komissiya faqat sotilgan mahsulotlar uchun olinadi. Sof foyda formula: (Sotuv narxi - Marketplace komissiyasi - Marketplace xarajatlari - 3% soliq - Tan narx) = Sof foyda</p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. HUQUQ VA MAJBURIYATLAR</h3>
                
                <h4 className="font-medium mt-3 mb-2">5.1. Hamkor huquqlari:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>O'z mahsulotlarini platformada sotish</li>
                  <li>Sotuvlar bo'yicha hisobotlar olish</li>
                  <li>Texnik qo'llab-quvvatlash olish</li>
                  <li>Yangi mahsulotlar so'rash</li>
                  <li>Tanlangan tarif bo'yicha barcha imkoniyatlardan foydalanish</li>
                </ul>

                <h4 className="font-medium mt-3 mb-2">5.2. MarketPlace Pro huquqlari:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sifatsiz mahsulotlarni rad etish</li>
                  <li>Shartnomani buzganlik uchun jarimalar undirish</li>
                  <li>Platformadan chiqarib yuborish</li>
                  <li>Qoidalarni o'zgartirish (oldindan ogohlantirish bilan)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. JAVOBGARLIK</h3>
                <p>Tomonlar o'z majburiyatlarini bajarmaslik uchun javobgar bo'ladilar. Shartnomani buzish holatlari:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>To'lovlarni kechiktirish (10 kundan ortiq)</li>
                  <li>Sifatsiz mahsulot taqdim etish</li>
                  <li>Mijozlar bilan noo'rin munosabat</li>
                  <li>Platformaning qoidalarini buzish</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. YAKUNIY QOIDALAR</h3>
                <p>Ushbu shartnoma imzolanganidan keyin kuchga kiradi va tomonlarning kelishuviga qadar amal qiladi. Shartnomani bekor qilish kamida 30 kun oldin yozma ravishda bildirilishi kerak.</p>
                <p className="mt-2"><strong>Sudga murojaat:</strong> Nizolar tinchlik yo'li bilan hal qilinadi, aks holda O'zbekiston Respublikasi qonunlariga muvofiq sudda ko'riladi.</p>
              </section>
            </div>

            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>MarketPlace Pro © 2024. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}