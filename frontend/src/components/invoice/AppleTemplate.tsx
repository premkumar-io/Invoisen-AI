import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function AppleTemplate({ data, currencySymbol }: TemplateProps) {
  const businessInfo = data?.businessInfo || { name: "Company Name", address: "", email: "", phone: "", gstNumber: "" };
  const clientInfo = data?.clientInfo || { name: "Client Name", address: "", email: "", phone: "", gstNumber: "" };
  const calculations = data?.calculations || { taxType: "None", taxRate: 0, discount: 0, shipping: 0 };
  const items = data?.items || [];
  const customization = data?.customization || {};

  const subtotal = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0
  );
  const discountAmount = calculations.discount || 0;
  const shippingAmount = calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-slate-900 p-10 md:p-14 font-sans min-h-[800px] flex flex-col justify-between">
      <div>
        {/* Apple Style Header */}
        <div className="flex justify-between items-start pb-10 border-b border-slate-100">
          <div>
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-12 max-w-[200px] object-contain mb-4"
              />
            ) : (
              <h1 className="text-3xl font-light tracking-tight text-slate-900 font-headline">
                {businessInfo.name || "YOUR COMPANY"}
              </h1>
            )}
            <div className="text-xs text-slate-500 space-y-1 font-normal pt-1">
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.gstNumber && <p className="font-mono">GST/Tax: {businessInfo.gstNumber}</p>}
            </div>
          </div>

          <div className="text-right space-y-2">
            <h2 className="text-4xl font-extralight tracking-tight text-slate-900">Invoice</h2>
            <div className="text-xs text-slate-500 space-y-1 font-mono pt-1">
              <p><span className="text-slate-400">Date:</span> {data.invoiceDate || "—"}</p>
              <p><span className="text-slate-400">Due Date:</span> {data.dueDate || "—"}</p>
            </div>
          </div>
        </div>

        {/* Client Card */}
        <div className="my-10 p-6 rounded-3xl bg-slate-50/70 border border-slate-100/80 backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Billed To
            </span>
            <h3 className="font-semibold text-slate-900 text-base">{clientInfo.name || "Client Name"}</h3>
            <div className="text-xs text-slate-500 space-y-0.5 mt-1">
              {clientInfo.address && <p>{clientInfo.address}</p>}
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.gstNumber && <p className="font-mono">GST/Tax: {clientInfo.gstNumber}</p>}
            </div>
          </div>
        </div>

        {/* Minimal Table */}
        <div className="mb-10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Rate</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-2">
                    <p className="font-medium text-slate-900">{item.name || "Item title"}</p>
                    {item.description && <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>}
                  </td>
                  <td className="py-4 px-2 text-center font-mono text-slate-500">{item.quantity || 0}</td>
                  <td className="py-4 px-2 text-right font-mono text-slate-500">
                    {currencySymbol}{(item.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-2 text-right font-mono font-semibold text-slate-900">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-72 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500 font-mono">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-mono font-medium">
                <span>Discount</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {shippingAmount > 0 && (
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Shipping</span>
                <span>+{currencySymbol}{shippingAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Tax ({calculations.taxType} {calculations.taxRate}%)</span>
                <span>+{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-semibold text-slate-900">
              <span>Total</span>
              <span className="font-mono text-xl font-bold text-slate-900">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-6 text-xs text-slate-400">
        <div className="space-y-1 max-w-sm">
          {data.notes && <p><span className="font-semibold text-slate-600">Notes:</span> {data.notes}</p>}
          {data.paymentTerms && <p><span className="font-semibold text-slate-600">Terms:</span> {data.paymentTerms}</p>}
        </div>

        {customization.signatureDataUrl && (
          <div className="text-center shrink-0">
            <img src={customization.signatureDataUrl} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
            <p className="font-semibold text-slate-800">{customization.signatureName || "Authorized Signatory"}</p>
            {customization.signatureTitle && <p className="text-[10px] text-slate-400">{customization.signatureTitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
