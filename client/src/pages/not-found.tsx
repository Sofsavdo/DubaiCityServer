import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl border-slate-700">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">404</CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Sahifa topilmadi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
          </p>
          <Button
            onClick={() => setLocation('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Bosh sahifaga qaytish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}