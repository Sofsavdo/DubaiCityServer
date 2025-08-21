import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FulfillmentCalculator } from "@/components/fulfillment-calculator";
import heroImage from "@assets/generated_images/Professional_marketplace_hero_image_6ea2fa47.png";
import tierImage from "@assets/generated_images/3-tier_commission_visualization_77d85af1.png";
import dashboardImage from "@assets/generated_images/Analytics_dashboard_preview_96ed3eb1.png";
import { 
  TrendingUp, 
  Package, 
  BarChart3, 
  Users, 
  CheckCircle, 
  Rocket,
  Play,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Store,
  Truck,
  Target
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleAdminLogin = () => {
    window.location.href = "/admin-login";
  };

  const handlePartnerRegistration = () => {
    window.location.href = "/partner-registration";
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">MarketPlace Pro</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#services" className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                  Xizmatlar
                </a>
                <a href="#dashboard" className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="#pricing" className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                  Narxlar
                </a>
                <Button onClick={handleLogin} className="bg-primary hover:bg-secondary mr-2">
                  Partner Kirish
                </Button>
                <Button variant="outline" onClick={handleAdminLogin} className="mr-2">
                  Admin Panel
                </Button>
                <Button variant="outline" onClick={handlePartnerRegistration}>
                  Hamkor Bo'lish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 via-white to-accent/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-medium text-primary">🚀 #1 Marketplace Management Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Professional
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block">
                  Marketplace Management
                </span>
                <span className="text-neutral-700">Services</span>
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Marketplace savdolaringizni professional darajada boshqaring. 
                <strong>Uzum Market, Wildberries, Yandex Market</strong> va <strong>MySklad</strong> bilan to'liq integratsiya.
                Mahsulot tayyorlashdan logistikagacha to'liq xizmat kompleksi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                  data-testid="button-start"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Admin Paneli
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/partner-registration'}
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transform hover:scale-105 transition-all bg-white/80 backdrop-blur-sm"
                  data-testid="button-partner"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Hamkor Bo'lish
                </Button>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <div className="relative bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
                <img 
                  src={heroImage} 
                  alt="Professional Marketplace Platform Dashboard"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-accent text-white p-3 rounded-xl shadow-lg animate-bounce">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary text-white p-3 rounded-xl shadow-lg animate-pulse">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-revenue">
              <div className="text-4xl font-bold text-primary mb-2">150M+</div>
              <div className="text-neutral-600">Oylik Aylanma</div>
            </div>
            <div className="text-center" data-testid="stat-profit">
              <div className="text-4xl font-bold text-accent mb-2">25%</div>
              <div className="text-neutral-600">Foyda Ulushi</div>
            </div>
            <div className="text-center" data-testid="stat-products">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-neutral-600">Mahsulot Turi</div>
            </div>
            <div className="text-center" data-testid="stat-satisfaction">
              <div className="text-4xl font-bold text-accent mb-2">99.8%</div>
              <div className="text-neutral-600">Mijoz Qoniqishi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">Hamkorlarimiz Fikri</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Bizning hamkorlarimiz qanday natijalarga erishganini ko'ring
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Aziz Karimov</h4>
                    <p className="text-sm text-neutral-600">Elektronika hamkori</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4">
                  "3 oy ichida oylik daromadim 5M dan 25M so'mga oshdi. Professional jamoa va sifatli xizmat!"
                </p>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent font-bold text-lg">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Malika Yusupova</h4>
                    <p className="text-sm text-neutral-600">Kiyim-kechak hamkori</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4">
                  "MySklad integratsiya va dashboard orqali barcha savdolarimni nazorat qilaman. Juda qulay!"
                </p>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-secondary font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Sardor Toshmatov</h4>
                    <p className="text-sm text-neutral-600">Sport tovarlari hamkori</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4">
                  "Professional fulfillment xizmati bilan mijozlarim juda qoniq. Qayta buyurtmalar ko'paydi!"
                </p>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">Professional Xizmatlar</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
              Marketplace savdolaringiz uchun to'liq professional yechim. Uzum Market, Wildberries, Yandex Market bilan integratsiya.
            </p>
            <div className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-6 py-3">
              <span className="text-primary font-semibold">🚀 To'liq Fulfillment Xizmati</span>
            </div>
          </div>
          
          {/* Main Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {/* Marketplace Management - Enhanced */}
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-primary/10" data-testid="card-marketplace">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Marketplace Boshqaruvi</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Professional mahsulot kartochkalari yaratish, SEO optimizatsiya, raqobat tahlili va savdo strategiyalari
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Professional kartochka dizayni va kontent</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">SEO optimizatsiya va kalit so'zlar tahlili</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Raqobat tahlili va bozor tadqiqoti</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Narx strategiyasi va pozitsiyalash</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">A/B test va optimizatsiya</span>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium">
                    💡 Uzum, Wildberries, Yandex Market uchun optimizatsiya
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logistics & Fulfillment - Enhanced */}
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-accent/10" data-testid="card-logistics">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Logistika va Fulfillment</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  To'liq logistik yechim: qabul qilish, saqlash, qadoqlash, yetkazib berish va qaytarish jarayonlari
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Professional qadoqlash va brending</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">24-48 soat ichida yetkazib berish</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">MySklad inventar boshqaruvi</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Qaytarish va almashtirish xizmati</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Mijozlar bilan aloqa va qo'llab-quvvatlash</span>
                  </div>
                </div>
                <div className="bg-accent/5 rounded-lg p-4">
                  <p className="text-sm text-accent font-medium">
                    📦 SPT: 2,000 so'm/dona (transparent narxlar)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Partner Dashboard & Analytics - Enhanced */}
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-secondary/10" data-testid="card-partner-analytics">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Hamkor Dashboard va Analitika</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  Hamkorlar uchun maxsus dashboard: savdo tahlili, ombor qoldiqlar, mahsulot harakati va foyda hisoboti
                </p>
                
                {/* Dashboard Description */}
                <div className="mb-6 bg-secondary/5 rounded-xl p-6 border border-secondary/10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mr-4">
                      <BarChart3 className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">Shaxsiy Analytics Dashboard</h4>
                      <p className="text-sm text-neutral-600">Hamkorlar uchun maxsus tayyorlangan</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700">
                    Har bir hamkor o'zining shaxsiy dashboardiga ega bo'lib, u orqali real vaqtda o'z savdo ko'rsatkichlarini kuzatib boradi.
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Ombor qoldiqlar real-time monitoring</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Mahsulot harakati va savdo tahlili</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">MySklad inventar integratsiya</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Kunlik/oylik foyda hisoboti</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">Marketplace performance ko'rsatkichlari</span>
                  </div>
                </div>
                <div className="bg-secondary/5 rounded-lg p-4">
                  <p className="text-sm text-secondary font-medium">
                    📊 Dashboard hamkorlar ro'yxatdan o'tgandan keyin ochiladi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Values & Additional Services - Integrated */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100">
            <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Bizning Professional Yondashuvimiz</h3>
            
            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">5+ Yillik Tajriba</h4>
                <p className="text-sm text-neutral-600">Professional marketplace management bo'yicha chuqur bilim</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">24/7 Monitoring</h4>
                <p className="text-sm text-neutral-600">Doimiy kuzatuv va tezkor javob berish</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Foyda Kafolati</h4>
                <p className="text-sm text-neutral-600">Transparent narxlar va haqiqiy natijalar</p>
              </div>
            </div>

            {/* Additional Services */}
            <div className="border-t pt-8">
              <h4 className="text-lg font-semibold text-neutral-900 mb-6 text-center">Qo'shimcha Professional Xizmatlar</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="font-medium text-neutral-900 mb-1 text-sm">Mijozlar Xizmati</h5>
                  <p className="text-xs text-neutral-600">24/7 qo'llab-quvvatlash</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <h5 className="font-medium text-neutral-900 mb-1 text-sm">Marketing Support</h5>
                  <p className="text-xs text-neutral-600">Reklama va brending</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-secondary" />
                  </div>
                  <h5 className="font-medium text-neutral-900 mb-1 text-sm">Mahsulot Sourcing</h5>
                  <p className="text-xs text-neutral-600">Yangi mahsulotlar topish</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h5 className="font-medium text-neutral-900 mb-1 text-sm">Strategik Konsalting</h5>
                  <p className="text-xs text-neutral-600">Biznes strategiyasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-neutral-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Professional Narx Strategiyasi
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Sizning muvaffaqiyatingiz bizning muvaffaqiyatingiz
            </p>
          </div>

          {/* Overview section - moved outside of card for full width */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 lg:p-12 border border-blue-100 shadow-lg">
              <h3 className="text-3xl font-bold text-neutral-900 mb-8 text-center">4-Darajali Professional Tarif Tizimi</h3>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-left space-y-4">
                  <p className="text-xl text-neutral-700">
                    <strong>Fiksa to'lov + Sof foydadan progressiv komissiya</strong>
                  </p>
                  <div className="text-neutral-600 leading-relaxed space-y-3">
                    <p>
                      Hamkor sof foydadan (barcha xarajatlar ayrilgandan keyin) progressiv tarzda komissiya to'laydi.
                    </p>
                    <p>
                      SPT (qadoqlash) xarajati: <strong>2,000 so'm/dona</strong> (barcha tariflarda bir xil).
                    </p>
                    <p>
                      <strong>To'liq fulfillment xizmati:</strong> akkaunt boshqaruv, kontent yaratish, qadoqlash, mijozlar bilan aloqa!
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={tierImage} 
                    alt="4-Tier Fulfillment Fee Structure"
                    className="w-full max-w-sm h-auto rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing cards - full width layout */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">


                {/* Starter Pro - Risk-free */}
                <Card className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="starter-pro">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      RISKSIZ BOSHLASH
                    </div>
                  </div>
                  <CardContent className="p-6 text-center pt-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-700 mb-2">
                      Starter Pro
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">0 so'm</div>
                    <div className="text-sm text-green-600 mb-4">fiksa to'lov</div>
                    <div className="bg-green-100 rounded-lg p-3 mb-4">
                      <div className="text-green-700 font-semibold text-sm">Sof foydaning</div>
                      <div className="text-green-800 font-bold text-lg">30-45%</div>
                    </div>
                    <ul className="text-sm text-neutral-700 space-y-2 text-left">
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Shaxsiy menejer</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Haftalik hisobotlar</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />25 mahsulot so'rovi/oy</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />MySklad integratsiya</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Asosiy marketplace</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Business Standard */}
                <Card className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="business-standard">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-blue-700 mb-2">
                      Business Standard
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">3.5M so'm</div>
                    <div className="text-sm text-blue-600 mb-4">fiksa to'lov</div>
                    <div className="bg-blue-100 rounded-lg p-3 mb-4">
                      <div className="text-blue-700 font-semibold text-sm">Sof foydaning</div>
                      <div className="text-blue-800 font-bold text-lg">18-25%</div>
                    </div>
                    <ul className="text-sm text-neutral-700 space-y-2 text-left">
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />API to'liq kirish</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />Kunlik hisobotlar</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />100 mahsulot so'rovi/oy</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />Priority chat support</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />Marketing konsultatsiya</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Professional Plus */}
                <Card className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-testid="professional-plus">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      PREMIUM
                    </div>
                  </div>
                  <CardContent className="p-6 text-center pt-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xl font-bold text-purple-700 mb-2">
                      Professional Plus
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">6M so'm</div>
                    <div className="text-sm text-purple-600 mb-4">fiksa to'lov</div>
                    <div className="bg-purple-100 rounded-lg p-3 mb-4">
                      <div className="text-purple-700 font-semibold text-sm">Sof foydaning</div>
                      <div className="text-purple-800 font-bold text-lg">15-20%</div>
                    </div>
                    <ul className="text-sm text-neutral-700 space-y-2 text-left">
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />Shaxsiy menejer</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />Custom dashboard</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />Cheksiz so'rovlar</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />24/7 VIP support</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />Priority queue</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Enterprise Elite */}
                <Card className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" data-testid="enterprise-elite">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      ENTERPRISE
                    </div>
                  </div>
                  <CardContent className="p-6 text-center pt-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-xl font-bold text-amber-700 mb-2">
                      Enterprise Elite
                    </div>
                    <div className="text-3xl font-bold text-amber-600 mb-1">10M so'm</div>
                    <div className="text-sm text-amber-600 mb-4">fiksa to'lov</div>
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3 mb-4">
                      <div className="text-amber-700 font-semibold text-sm">Sof foydaning</div>
                      <div className="text-amber-800 font-bold text-lg">12-18%</div>
                    </div>
                    <ul className="text-sm text-neutral-700 space-y-2 text-left">
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />Custom packaging</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />VIP fulfillment</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />Real-time optimization</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />Executive insights</li>
                      <li className="flex items-center"><CheckCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />Dedicated account</li>
                    </ul>
                  </CardContent>
                </Card>
            </div>

            {/* CTA section */}
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <Button 
                  onClick={() => window.location.href = '/partner-registration'}
                  size="lg"
                  className="bg-primary hover:bg-secondary transform hover:scale-105 transition-all shadow-lg"
                  data-testid="button-partnership"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Hamkorlik Boshlash
                </Button>
                <p className="text-sm text-neutral-600 mt-4">15 kunlik sinov muddati bilan</p>
              </div>
              
              {/* Professional Commission Calculator */}
              <div className="mt-12">
                <h4 className="text-2xl font-semibold text-neutral-900 mb-6 text-center">Professional Komissiya Kalkulyatori</h4>
                <FulfillmentCalculator className="max-w-4xl mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hamkorlikni Bugun Boshlaylik
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Professional marketplace management xizmati bilan biznesingizni keyingi bosqichga olib chiqing
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center cursor-pointer hover:scale-105 transition-transform" data-testid="contact-phone" onClick={() => window.open('tel:+998901234567')}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Telefon</h3>
              <p className="text-blue-100">+998 90 123 45 67</p>
            </div>
            
            <div className="text-center cursor-pointer hover:scale-105 transition-transform" data-testid="contact-email" onClick={() => window.open('mailto:info@marketplacepro.uz')}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-blue-100">info@marketplacepro.uz</p>
            </div>
            
            <div className="text-center cursor-pointer hover:scale-105 transition-transform" data-testid="contact-telegram" onClick={() => window.open('https://t.me/MarketplacePro', '_blank')}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Telegram</h3>
              <p className="text-blue-100">@MarketplacePro</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-neutral-100 transform hover:scale-105 transition-all shadow-lg"
              data-testid="button-consultation"
              onClick={() => window.open('https://t.me/MarketplacePro', '_blank')}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Bepul Konsultatsiya
            </Button>
            <Button 
              size="lg"
              className="bg-accent text-white hover:bg-green-600 transform hover:scale-105 transition-all shadow-lg"
              data-testid="button-partner-registration"
              onClick={() => window.location.href = '/partner-registration'}
            >
              <Users className="mr-2 h-5 w-5" />
              Hamkor Bo'lish
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-bold mb-4 text-primary">MarketPlace Pro</h3>
              <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
                Professional marketplace management xizmatlari orqali biznesingizni rivojlantiring va yuqori daromad oling. 
                Uzum Market, Wildberries, Yandex Market bilan to'liq integratsiya.
              </p>
              <div className="flex space-x-4">
                <div 
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors"
                  onClick={() => window.open('https://t.me/MarketplacePro', '_blank')}
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div 
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors"
                  onClick={() => window.open('mailto:info@marketplacepro.uz')}
                >
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div 
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors"
                  onClick={() => window.open('tel:+998901234567')}
                >
                  <Phone className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Xizmatlar</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#services" className="hover:text-primary transition-colors cursor-pointer">Marketplace Management</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors cursor-pointer">MySklad Integratsiya</a></li>
                <li><a href="#dashboard" className="hover:text-primary transition-colors cursor-pointer">Analitika Dashboard</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors cursor-pointer">4-Tier Pricing</a></li>
                <li className="hover:text-primary transition-colors cursor-pointer">Logistika va Fulfillment</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Professional Konsalting</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Kompaniya</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><span className="hover:text-primary transition-colors cursor-pointer">Biz Haqimizda</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Professional Jamoa</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Karyera Imkoniyatlari</span></li>
                <li><a href="#contact" className="hover:text-primary transition-colors cursor-pointer">Aloqa</a></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Shartlar va Qoidalar</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Maxfiylik Siyosati</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 mb-4 md:mb-0">
                © 2025 MarketPlace Pro. Barcha huquqlar himoyalangan.
              </p>
              <div className="flex space-x-6 text-sm text-neutral-400">
                <span className="hover:text-primary transition-colors cursor-pointer">Foydalanish Shartlari</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Maxfiylik</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Yordam</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
