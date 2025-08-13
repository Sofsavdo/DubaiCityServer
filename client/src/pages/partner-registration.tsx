import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  Package,
  DollarSign,
  Phone,
  MapPin,
  User,
  Lock,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  Users,
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function PartnerRegistration() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    login: "",
    password: "",
    phoneNumber: "",
    address: "",
    productCategory: "",
    investmentAmount: "",
    businessExperience: "",
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/partner-registration-requests", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Muvaffaqiyat!",
        description: "Sizning so'rovingiz muvaffaqiyatli yuborildi. Tez orada admin bilan bog'lanamiz.",
      });
    },
    onError: (error) => {
      toast({
        title: "Xatolik",
        description: "So'rovni yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrationMutation.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              So'rov Yuborildi!
            </h2>
            <p className="text-neutral-600 mb-6">
              Sizning hamkorlik so'rovingiz muvaffaqiyatli yuborildi. Admin tomonidan ko'rib chiqilgandan so'ng, siz bilan bog'lanamiz.
            </p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Bosh sahifaga qaytish
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            MarketPlace Pro hamkori bo'ling
          </h1>
          <p className="text-xl text-neutral-700 mb-8 max-w-2xl mx-auto">
            Bizning platformamizda hamkor sifatida ro'yxatdan o'ting va daromadingizni oshiring
          </p>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Yuqori Daromad
              </h3>
              <p className="text-neutral-600 text-sm">
                3 xil obuna tarifi: 2.5M, 4.5M, 6.5M so'mgacha daromad olish imkoniyati
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Keng Tarmoq
              </h3>
              <p className="text-neutral-600 text-sm">
                Minglab mijozlar va yetkazib beruvchilar bilan hamkorlik qiling
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Professional Qo'llab-quvvatlash
              </h3>
              <p className="text-neutral-600 text-sm">
                24/7 texnik yordam va biznes konsultatsiya xizmatlari
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-neutral-900 mb-2">
              Hamkor sifatida ro'yxatdan o'ting
            </CardTitle>
            <p className="text-neutral-600">
              Quyidagi forma orqali hamkorlik so'rovini yuboring
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Shaxsiy Ma'lumotlar
                </h3>
                
                <div>
                  <Label htmlFor="fullName">To'liq ism</Label>
                  <Input
                    id="fullName"
                    data-testid="input-fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Familiya Ism Otasining ismi"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="login">Login</Label>
                    <Input
                      id="login"
                      data-testid="input-login"
                      type="text"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      placeholder="Loginni kiriting"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Parol</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input
                        id="password"
                        data-testid="input-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Parolni kiriting"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Telefon raqam</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input
                        id="phoneNumber"
                        data-testid="input-phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+998 90 123 45 67"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Manzil</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input
                        id="address"
                        data-testid="input-address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Shahar, tuman"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Biznes Ma'lumotlari
                </h3>

                <div>
                  <Label htmlFor="productCategory">Mahsulot toifasi</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Select
                      value={formData.productCategory}
                      onValueChange={(value) => setFormData({ ...formData, productCategory: value })}
                    >
                      <SelectTrigger className="pl-10" data-testid="select-productCategory">
                        <SelectValue placeholder="Mahsulot toifasini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Elektronika</SelectItem>
                        <SelectItem value="clothing">Kiyim-kechak</SelectItem>
                        <SelectItem value="food">Oziq-ovqat</SelectItem>
                        <SelectItem value="beauty">Go'zallik va sog'liq</SelectItem>
                        <SelectItem value="home">Uy uchun mahsulotlar</SelectItem>
                        <SelectItem value="sports">Sport tovarlari</SelectItem>
                        <SelectItem value="books">Kitoblar va o'quv materiallari</SelectItem>
                        <SelectItem value="toys">O'yinchoqlar</SelectItem>
                        <SelectItem value="automotive">Avtomobil ehtiyot qismlari</SelectItem>
                        <SelectItem value="other">Boshqa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="investmentAmount">Investitsiya miqdori (so'm)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="investmentAmount"
                      data-testid="input-investmentAmount"
                      type="text"
                      value={formData.investmentAmount}
                      onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                      placeholder="Masalan: 10,000,000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessExperience">Biznes tajribasi (ixtiyoriy)</Label>
                  <Textarea
                    id="businessExperience"
                    data-testid="textarea-businessExperience"
                    value={formData.businessExperience}
                    onChange={(e) => setFormData({ ...formData, businessExperience: e.target.value })}
                    placeholder="Oldingi biznes tajribangiz haqida qisqacha ma'lumot bering..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Submission */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={registrationMutation.isPending}
                  data-testid="button-submit"
                >
                  {registrationMutation.isPending ? "Yuborilmoqda..." : "So'rov yuborish"}
                </Button>
                
                <div className="text-center mt-4">
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Bosh sahifaga qaytish
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}