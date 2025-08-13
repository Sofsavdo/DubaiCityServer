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
    window.location.href = "/api/login";
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
                  Kirish
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/partner-registration'}>
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
                <strong>Yandex Market, Uzum Market</strong> va <strong>MySklad</strong> bilan to'liq integratsiya.
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

      {/* Services Section */}
      <section id="services" className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Professional Xizmatlar</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Marketplace savdolaringiz uchun to'liq professional yechim
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow" data-testid="card-marketplace">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Marketplace Boshqaruvi</h3>
                <p className="text-neutral-600 mb-6">
                  Mahsulot kartochkalarini yaratish, savdoni tashkillashtirish va optimizatsiya qilish
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Professional kartochka dizayni
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    SEO optimizatsiya
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Raqobat tahlili
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow" data-testid="card-logistics">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                  <Truck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Logistika va Yetkazib Berish</h3>
                <p className="text-neutral-600 mb-6">
                  Tovarlarni tayyorlash, qadoqlash va tezkor yetkazib berish xizmatlari
                </p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Professional qadoqlash
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Tezkor yetkazib berish
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Inventar boshqaruvi
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow" data-testid="card-analytics">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Analitika va Hisobot</h3>
                <p className="text-neutral-600 mb-6">
                  Real vaqtda savdo tahlili, foyda hisoblash va strategik rejalashtirish
                </p>
                
                {/* Dashboard Preview Image */}
                <div className="mb-6">
                  <img 
                    src={dashboardImage} 
                    alt="Analytics Dashboard Preview"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Real-time monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Foyda tahlili
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2" />
                    Strategik maslahatlar
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Professional Narx Strategiyasi
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Sizning muvaffaqiyatingiz bizning muvaffaqiyatingiz
            </p>
          </div>

          <Card className="max-w-4xl mx-auto" data-testid="card-pricing">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">3-Darajali Fulfillment Xizmat Haqqi Tizimi</h3>
                <div className="grid lg:grid-cols-2 gap-8 items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <p className="text-lg text-neutral-700 mb-4">
                      <strong>Fiksa to'lov + Sof foydadan bonus</strong>
                    </p>
                    <p className="text-sm text-neutral-600">
                      Tadbirkor tanlagan tarif bo'yicha fiksa to'lov + savdo limitini bajarganda sof foydadan bonus to'laydi.<br/>
                      Bu fulfillmentga to'lanishi kerak bo'lgan xizmat haqqi!
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={tierImage} 
                      alt="3-Tier Fulfillment Fee Structure"
                      className="w-full max-w-md h-auto rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" data-testid="tier-1">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-primary mb-2">Tier 1 - Boshlang'ich</div>
                    <div className="text-blue-600 text-lg font-semibold mb-2">2.5M so'm fiksa</div>
                    <div className="text-blue-600 text-sm mb-3">+ 15M so'mdan sof foydaning 12-23%</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Asosiy fulfillment</li>
                      <li>• Standart yetkazib berish</li>
                      <li>• Haftalik hisobot</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-accent shadow-lg relative" data-testid="tier-2">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold">OPTIMAL</span>
                  </div>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-accent mb-2">Tier 2 - Professional</div>
                    <div className="text-green-600 text-lg font-semibold mb-2">4.5M so'm fiksa</div>
                    <div className="text-green-600 text-sm mb-3">+ 45M so'mdan sof foydaning 12-23%</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Kengaytirilgan fulfillment</li>
                      <li>• Premium logistics</li>
                      <li>• Kunlik monitoring</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" data-testid="tier-3">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">Tier 3 - Premium</div>
                    <div className="text-purple-600 text-lg font-semibold mb-2">6.5M so'm fiksa</div>
                    <div className="text-purple-600 text-sm mb-3">+ 80M so'mdan sof foydaning 12-23%</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Premium fulfillment</li>
                      <li>• VIP logistics</li>
                      <li>• Real-time support</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Sizga Bergan Qiymatimiz:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">5+ yillik tajriba</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">Remote ishlash imkoniyati</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">24/7 monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">Professional analitika</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">To'liq logistik yechim</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-neutral-700">Foyda kafolati</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-primary hover:bg-secondary transform hover:scale-105 transition-all shadow-lg"
                  data-testid="button-partnership"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Hamkorlik Boshlash
                </Button>
                <p className="text-sm text-neutral-600 mt-4">15 kunlik sinov muddati bilan</p>
              </div>
              
              {/* Fulfillment Service Fee Calculator for Landing Page */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4 text-center">Fulfillment Xizmat Haqqi Kalkulyatori</h4>
                <FulfillmentCalculator className="max-w-2xl mx-auto" />
              </div>
            </CardContent>
          </Card>
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
            <div className="text-center" data-testid="contact-phone">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Telefon</h3>
              <p className="text-blue-100">+998 90 123 45 67</p>
            </div>
            
            <div className="text-center" data-testid="contact-email">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-blue-100">info@marketplacepro.uz</p>
            </div>
            
            <div className="text-center" data-testid="contact-telegram">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
              data-testid="button-meeting"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Uchrashuv Belgilash
            </Button>
            <Button 
              size="lg"
              className="bg-accent text-white hover:bg-green-600 transform hover:scale-105 transition-all shadow-lg"
              data-testid="button-consultation"
            >
              <Users className="mr-2 h-5 w-5" />
              Bepul Konsultatsiya
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">MarketPlace Pro</h3>
              <p className="text-neutral-400 mb-6 max-w-md">
                Professional marketplace management xizmatlari orqali biznesingizni rivojlantiring va yuqori daromad oling.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Xizmatlar</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>Marketplace Management</li>
                <li>Logistika</li>
                <li>Analitika</li>
                <li>Konsalting</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Kompaniya</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>Biz Haqimizda</li>
                <li>Jamoa</li>
                <li>Karyera</li>
                <li>Aloqa</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
            <p className="text-neutral-400">© 2024 MarketPlace Pro. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
