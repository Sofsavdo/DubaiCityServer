import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getAllPartnerActivationRequestsAdmin, approvePartnerActivation, rejectPartnerActivation } from "@/lib/api";
import { CheckCircle, XCircle, Building2, FileText, CreditCard } from "lucide-react";

type Activation = {
  id: string;
  partnerId: string;
  companyName?: string;
  legalForm?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  mfo?: string;
  legalAddress?: string;
  companyDocuments?: string; // JSON array
  chosenTier: 'basic' | 'professional' | 'professional_plus' | 'enterprise';
  activationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
};

export default function AdminActivationManagement() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      window.location.href = '/admin-login';
    }
  }, [user, isLoading]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllPartnerActivationRequestsAdmin();
      setItems(data.list || []);
    } catch (e) {
      toast({ title: 'Xato', description: 'Aktivatsiya so\'rovlarini olishda xatolik', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      await approvePartnerActivation(id);
      toast({ title: 'Tasdiqlandi', description: 'Aktivatsiya tasdiqlandi' });
      load();
    } catch {
      toast({ title: 'Xato', description: 'Tasdiqlashda xatolik', variant: 'destructive' });
    }
  };

  const reject = async (id: string) => {
    if (!rejectNote.trim()) {
      toast({ title: 'Xato', description: 'Rad etish sababi majburiy', variant: 'destructive' });
      return;
    }
    try {
      await rejectPartnerActivation(id, rejectNote);
      toast({ title: 'Rad etildi', description: 'Aktivatsiya rad etildi' });
      setRejectNote('');
      load();
    } catch {
      toast({ title: 'Xato', description: 'Rad etishda xatolik', variant: 'destructive' });
    }
  };

  const statusText = (s: string) => s === 'pending' ? 'Kutilmoqda' : s === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan';
  const statusColor = (s: string) => s === 'pending' ? 'bg-yellow-100 text-yellow-800' : s === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="activations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activations">Aktivatsiya so'rovlari</TabsTrigger>
          </TabsList>
          <TabsContent value="activations">
            <Card>
              <CardHeader>
                <CardTitle>Hamkor aktivatsiya so'rovlari</CardTitle>
                <CardDescription>Yuridik ma'lumotlar, tarif va hujjatlar</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-sm">Yuklanmoqda...</div>
                ) : (
                  <div className="space-y-4">
                    {items.map((a) => {
                      const docs = (() => { try { return JSON.parse(a.companyDocuments || '[]'); } catch { return []; } })();
                      return (
                        <div key={a.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Building2 className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-medium">{a.companyName || 'Kompaniya'}</div>
                                <div className="text-xs text-neutral-600">{a.legalForm || '–'} • {a.taxId || '–'}</div>
                                <div className="text-xs text-neutral-600">{a.bankName || '–'} • {a.bankAccount || '–'} • {a.mfo || '–'}</div>
                              </div>
                            </div>
                            <Badge className={statusColor(a.activationStatus)}>{statusText(a.activationStatus)}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div className="text-sm">
                              <div className="text-neutral-600">Tarif</div>
                              <div className="font-medium flex items-center"><CreditCard className="h-4 w-4 mr-1" /> {a.chosenTier}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-neutral-600">Manzil</div>
                              <div className="font-medium">{a.legalAddress || '–'}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-neutral-600">Hujjatlar</div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {docs.length === 0 ? (
                                  <span className="text-xs text-neutral-500">Hujjatlar yo'q</span>
                                ) : (
                                  docs.map((d: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="flex items-center"><FileText className="h-3 w-3 mr-1" /> {d}</Badge>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                          {a.activationStatus === 'pending' && (
                            <div className="flex items-center justify-end space-x-2 mt-3">
                              <Button size="sm" onClick={() => approve(a.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Tasdiqlash
                              </Button>
                              <Textarea placeholder="Sabab" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="h-9 w-48" />
                              <Button size="sm" variant="outline" onClick={() => reject(a.id)}>
                                <XCircle className="h-4 w-4 mr-1" /> Rad etish
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-sm text-neutral-600">Hozircha so'rovlar yo'q</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


