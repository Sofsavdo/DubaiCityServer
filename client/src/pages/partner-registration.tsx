import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, ArrowLeft, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  login: z.string().min(3, "Login kamida 3 ta belgi bo'lishi kerak"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqami noto'g'ri"),
  address: z.string().min(5, "Manzil kamida 5 ta belgi bo'lishi kerak"),
  productCategory: z.string().min(1, "Mahsulot toifasini tanlang"),
  investmentAmount: z.string().min(1, "Investitsiya miqdorini kiriting"),
  productQuantity: z.number().min(1, "Mahsulot sonini kiriting"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function PartnerRegistration() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      login: "",
      password: "",
      phone: "",
      address: "",
      productCategory: "",
      investmentAmount: "",
      productQuantity: 1,
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partner-registration-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Muvaffaqiyatli ro'yxatdan o'tish",
          description: "So'rovingiz yuborildi. Admin tasdiqlashini kuting.",
        });
        
        form.reset();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Tizimda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Muvaffaqiyatli!</CardTitle>
            <CardDescription className="text-slate-600">
              Ro'yxatdan o'tish so'rovi yuborildi
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Sizning so'rovingiz admin tomonidan ko'rib chiqiladi. Tasdiqlangandan so'ng SMS orqali xabar beramiz.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Tizimga kirish
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="w-full"
              >
                Bosh sahifaga qaytish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-slate-700">
        <CardHeader className="space-y-1 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="absolute top-4 left-4 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Orqaga
          </Button>
          
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Hamkor bo'lish</CardTitle>
          <CardDescription className="text-slate-600">
            Bizning hamkor tarmoqimizga qo'shiling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Loginni kiriting"
                          disabled={isLoading}
                          className="bg-slate-50 border-slate-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parol</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Parolni kiriting"
                            disabled={isLoading}
                            className="bg-slate-50 border-slate-300 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon raqami</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+998901234567"
                        disabled={isLoading}
                        className="bg-slate-50 border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manzil</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="To'liq manzilni kiriting"
                        disabled={isLoading}
                        className="bg-slate-50 border-slate-300"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mahsulot toifasi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-300">
                          <SelectValue placeholder="Mahsulot toifasini tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Electronics">Elektronika</SelectItem>
                        <SelectItem value="Fashion">Kiyim va moda</SelectItem>
                        <SelectItem value="Home">Uy jihozlari</SelectItem>
                        <SelectItem value="Sports">Sport va faollik</SelectItem>
                        <SelectItem value="Beauty">Go'zallik va parvarish</SelectItem>
                        <SelectItem value="Books">Kitoblar</SelectItem>
                        <SelectItem value="Toys">O'yinchoqlar</SelectItem>
                        <SelectItem value="Food">Oziq-ovqat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investitsiya (so'm)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="1000000"
                          disabled={isLoading}
                          className="bg-slate-50 border-slate-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mahsulot soni</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="50"
                          disabled={isLoading}
                          className="bg-slate-50 border-slate-300"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Yuborilmoqda..." : "Hamkor bo'lish uchun ariza berish"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Allaqachon akkauntingiz bormi?
              </p>
              <Button
                variant="outline"
                onClick={() => setLocation('/login')}
                className="w-full"
              >
                Tizimga kirish
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}