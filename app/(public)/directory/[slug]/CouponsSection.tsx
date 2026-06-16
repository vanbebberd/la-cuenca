"use client";
import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  usedCount: number;
  validTo?: Date | string | null;
}

export function CouponsSection({ coupons }: { coupons: Coupon[] }) {
  if (!coupons.length) return null;
  return (
    <section className="bg-white rounded-2xl border border-emerald-100 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Ticket className="h-4 w-4 text-emerald-600" />
        Cupones de descuento
      </h2>
      <div className="space-y-3">
        {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
      </div>
    </section>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const discountLabel =
    coupon.discountType === "PERCENT"
      ? `${coupon.discountValue}% OFF`
      : `$${coupon.discountValue.toLocaleString("es-CL")} OFF`;

  const isExhausted = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
  const isExpired = coupon.validTo && new Date(coupon.validTo) < new Date();
  const unavailable = isExhausted || isExpired;

  function copy() {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${unavailable ? "bg-gray-50 border-gray-200 opacity-60" : "bg-emerald-50 border-emerald-100"}`}>
      {/* Discount badge */}
      <div className="shrink-0 mt-0.5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${unavailable ? "bg-gray-200 text-gray-500" : "bg-emerald-600 text-white"}`}>
          {discountLabel}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{coupon.title}</p>
        {coupon.description && <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {coupon.minPurchase && (
            <span className="text-xs text-gray-400">Compra mín. ${coupon.minPurchase.toLocaleString("es-CL")}</span>
          )}
          {coupon.validTo && !isExpired && (
            <span className="text-xs text-gray-400">
              Válido hasta {new Date(coupon.validTo).toLocaleDateString("es-CL")}
            </span>
          )}
          {isExpired && <span className="text-xs text-red-500 font-medium">Expirado</span>}
          {isExhausted && <span className="text-xs text-red-500 font-medium">Sin usos disponibles</span>}
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={copy}
        disabled={!!unavailable}
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
          unavailable
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : copied
            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
            : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        <span className="font-mono tracking-widest text-xs">{coupon.code}</span>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
