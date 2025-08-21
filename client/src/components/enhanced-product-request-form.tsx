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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle, Package, Truck, X, Upload, Image } from "lucide-react";

interface ProductItem {
  id: string;
  productName: string;
  description: string;
  expectedQuantity: string;
  estimatedPrice: string;
  imageFile?: File;
  imagePreview?: string;
}

export function EnhancedProductRequestForm() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [supplierInfo, setSupplierInfo] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    id: "",
    productName: "",
    description: "",
    expectedQuantity: "",
    estimatedPrice: "",
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: { products: ProductItem[]; supplierInfo: string; urgencyLevel: string }) => {
      // Create bulk request with all products
      return apiRequest("POST", "/api/product-requests/bulk", data);
    },
    onSuccess: () => {
      toast({
        title: "So'rovlar yuborildi",
        description: `${products.length} ta mahsulot so'rovi muvaffaqiyatli yuborildi. Admin ko'rib chiqadi.`,
      });
      // Reset form
      setProducts([]);
      setSupplierInfo("");
      setUrgencyLevel("normal");
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Xato",
        description: "So'rovlarni yuborishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  const addProduct = () => {
    if (!currentProduct.productName || !currentProduct.expectedQuantity) {
      toast({
        title: "Ma'lumot yetishmaydi",
        description: "Mahsulot nomi va miqdorni kiriting",
        variant: "destructive",
      });
      return;
    }
    
    const newProduct = {
      ...currentProduct,
      id: Date.now().toString(),
    };
    
    setProducts([...products, newProduct]);
    setCurrentProduct({
      id: "",
      productName: "",
      description: "",
      expectedQuantity: "",
      estimatedPrice: "",
    });
    setIsDialogOpen(false);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Fayl hajmi katta",
          description: "Rasm hajmi 5MB dan kichik bo'lishi kerak",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentProduct({
          ...currentProduct,
          imageFile: file,
          imagePreview: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAll = () => {
    if (products.length === 0) {
      toast({
        title: "Mahsulot yo'q",
        description: "Kamida bitta mahsulot qo'shing",
        variant: "destructive",
      });
      return;
    }
    
    createRequestMutation.mutate({
      products,
      supplierInfo,
      urgencyLevel,
    });
  };

  const urgencyColors = {
    low: "bg-blue-100 text-blue-800",
    normal: "bg-green-100 text-green-800", 
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      {/* Supplier Information (Common for all products) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Taminotchi Ma'lumotlari</span>
          </CardTitle>
          <CardDescription>
            Barcha mahsulotlar uchun umumiy taminotchi ma'lumotlari
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplierInfo">Taminotchi haqida ma'lumot</Label>
            <Textarea
              id="supplierInfo"
              value={supplierInfo}
              onChange={(e) => setSupplierInfo(e.target.value)}
              placeholder="Kompaniya nomi, manzil, telefon raqam, boshqa ma'lumotlar..."
              rows={3}
              data-testid="textarea-supplier-info"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Umumiy muhimlik darajasi</Label>
            <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
              <SelectTrigger data-testid="select-urgency-level">
                <SelectValue placeholder="Muhimlik darajasini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Kam muhim</SelectItem>
                <SelectItem value="normal">O'rtacha</SelectItem>
                <SelectItem value="high">Muhim</SelectItem>
                <SelectItem value="urgent">Juda muhim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Mahsulotlar Ro'yxati ({products.length})</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Mahsulot Qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yangi Mahsulot Qo'shish</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Mahsulot nomi *</Label>
                      <Input
                        id="productName"
                        value={currentProduct.productName}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, productName: e.target.value })}
                        placeholder="Mahsulot nomini kiriting"
                        data-testid="input-product-name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expectedQuantity">Kutilayotgan miqdor *</Label>
                      <Input
                        id="expectedQuantity"
                        type="number"
                        value={currentProduct.expectedQuantity}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, expectedQuantity: e.target.value })}
                        placeholder="Miqdorni kiriting"
                        data-testid="input-expected-quantity"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Batafsil tavsif</Label>
                    <Textarea
                      id="description"
                      value={currentProduct.description}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      placeholder="Mahsulot haqida batafsil ma'lumot"
                      rows={3}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedPrice">Tan narx (so'm)</Label>
                    <Input
                      id="estimatedPrice"
                      type="number"
                      value={currentProduct.estimatedPrice}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, estimatedPrice: e.target.value })}
                      placeholder="Tan narxni kiriting"
                      data-testid="input-estimated-price"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="productImage">Mahsulot rasmi (ixtiyoriy)</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('productImage')?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Rasm tanlash</span>
                      </Button>
                      {currentProduct.imagePreview && (
                        <div className="relative">
                          <img
                            src={currentProduct.imagePreview}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => setCurrentProduct({ ...currentProduct, imageFile: undefined, imagePreview: undefined })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button type="button" onClick={addProduct}>
                      Qo'shish
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>Hali mahsulot qo'shilmagan</p>
              <p className="text-sm">Yuqoridagi tugma orqali mahsulot qo'shing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {product.imagePreview && (
                      <img
                        src={product.imagePreview}
                        alt={product.productName}
                        className="h-12 w-12 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{product.productName}</h4>
                      <p className="text-sm text-neutral-600">Miqdor: {product.expectedQuantity}</p>
                      {product.estimatedPrice && (
                        <p className="text-sm text-neutral-600">Narx: {Number(product.estimatedPrice).toLocaleString()} so'm</p>
                      )}
                      {product.description && (
                        <p className="text-xs text-neutral-500 mt-1">{product.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                    data-testid={`button-remove-product-${product.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Section */}
      {products.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={urgencyColors[urgencyLevel as keyof typeof urgencyColors]}>
                  {urgencyLevel === 'low' && 'Kam muhim'}
                  {urgencyLevel === 'normal' && 'O\'rtacha'}
                  {urgencyLevel === 'high' && 'Muhim'}
                  {urgencyLevel === 'urgent' && 'Juda muhim'}
                </Badge>
                {urgencyLevel === 'urgent' && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Tezkor ko'rib chiqiladi</span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleSubmitAll} 
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-all-requests"
                className="bg-primary hover:bg-primary/90"
              >
                {createRequestMutation.isPending ? "Yuborilmoqda..." : `${products.length} ta So'rov Yuborish`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}