import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function CyberTemplate({ data, currencySymbol }: TemplateProps) {
  const businessInfo = data?.businessInfo || { name: "Invoisen AI", address: "", email: "", country: "" };
  const clientInfo = data?.clientInfo || { name: "Client", address: "", email: "" };
  const calculations = data?.calculations || { taxType: "None", taxRate: 0, discount: 0, shipping: 0 };
  const items = data?.items || [];

  const subtotal = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = calculations.discount || 0;
  const shippingAmount = calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-slate-950 text-slate-100 p-10 font-mono relative overflow-hidden border-2 border-emerald-500/40 rounded-xl shadow-2xl">
      {/* Background Cyber Grid Accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-emerald-500/30 pb-6 mb-8 relative z-10">
        <div>
          {businessInfo.logoUrl ? (
            <img
              src={businessInfo.logoUrl}
              alt="Company Logo"
              className="h-12 max-w-48 object-contain mb-2"
            />
          ) : (
            <h1 className="text-3xl font-black text-emerald-400 tracking-tight">{businessInfo.name}</h1>
          )}
          <p className="text-xs text-slate-400 font-sans mt-1">{businessInfo.address}</p>
          <p className="text-xs text-slate-400 font-sans">{businessInfo.email}</p>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-xs font-bold uppercase tracking-widest mb-1">
            Cyber Verified
          </div>
          <h2 className="text-xl font-black text-white">{data.invoiceNumber}</h2>
          <p className="text-xs text-slate-400">Date: {data.invoiceDate}</p>
          <p className="text-xs text-slate-400">Due: {data.dueDate}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 mb-8 grid grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-emerald-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
            Client Entity // Billed To
          </span>
          <p className="text-sm font-bold text-white">{data.clientInfo.name}</p>
          <p className="text-slate-400">{data.clientInfo.address}</p>
          <p className="text-slate-400">{data.clientInfo.email}</p>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
            Settlement Info
          </span>
          <p className="text-slate-300">Status: <span className="text-emerald-400 font-bold">Encrypted Active</span></p>
          <p className="text-slate-300">Network: Swiss Vector Rail</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-emerald-500/30 text-emerald-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 text-left">Deliverable / Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Rate</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.items.map((item, i) => (
              <tr key={i} className="hover:bg-slate-900/50">
                <td className="py-3 font-sans text-slate-200">{item.name}</td>
                <td className="py-3 text-right text-slate-300">{item.quantity}</td>
                <td className="py-3 text-right text-slate-300">
                  {currencySymbol}{item.rate.toFixed(2)}
                </td>
                <td className="py-3 text-right font-bold text-white">
                  {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Discount</span>
              <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Tax ({data.calculations.taxRate}%)</span>
              <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>
          )}
          {shippingAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span>{currencySymbol}{shippingAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-emerald-400">
            <span>Total Payable</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes & Signature */}
      <div className="border-t border-slate-800 pt-6 flex justify-between items-end text-xs text-slate-400">
        <div className="max-w-md space-y-1">
          {data.notes && <p>{data.notes}</p>}
          {data.paymentTerms && <p className="text-emerald-400 font-semibold">{data.paymentTerms}</p>}
        </div>
        {data.customization?.signatureDataUrl && (
          <div className="text-right">
            <img
              src={data.customization.signatureDataUrl}
              alt="Signature"
              className="h-10 ml-auto invert brightness-200"
            />
            <p className="font-bold text-white mt-1">{data.customization.signatureName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
