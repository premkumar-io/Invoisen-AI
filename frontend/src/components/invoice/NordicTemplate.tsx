import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function NordicTemplate({ data, currencySymbol }: TemplateProps) {
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
    <div className="bg-[#f8fafc] text-slate-900 p-8 md:p-12 font-sans min-h-[800px] flex flex-col justify-between">
      <div>
        {/* Dark Nordic Header Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6 shadow-xl">
          <div className="space-y-2">
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-12 max-w-[200px] object-contain brightness-200 mb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold tracking-wider uppercase font-headline">
                {businessInfo.name || "YOUR COMPANY"}
              </h1>
            )}
            <div className="text-xs text-slate-300 space-y-0.5 font-light">
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.gstNumber && <p className="font-mono text-slate-400">TAX: {businessInfo.gstNumber}</p>}
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-mono text-xs font-bold uppercase tracking-widest border border-slate-700">
              INVOICE
            </span>
            <div className="text-xs text-slate-300 space-y-1 font-mono pt-3">
              <p><span className="text-slate-400">Date:</span> {data.invoiceDate || "—"}</p>
              <p><span className="text-slate-400">Due:</span> {data.dueDate || "—"}</p>
            </div>
          </div>
        </div>

        {/* Client Meta */}
        <div className="mb-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Billed To
            </span>
            <h2 className="font-bold text-slate-900 text-sm">{clientInfo.name || "Client Name"}</h2>
            <div className="text-xs text-slate-500 space-y-0.5 mt-1">
              {clientInfo.address && <p>{clientInfo.address}</p>}
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.gstNumber && <p className="font-mono">TAX: {clientInfo.gstNumber}</p>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden mb-8 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{item.name || "Item title"}</p>
                    {item.description && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">{item.quantity || 0}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {currencySymbol}{(item.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-72 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 text-xs">
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
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Amount</span>
              <span className="font-mono text-lg text-slate-900">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end gap-6 text-xs text-slate-400">
        <div className="space-y-1 max-w-sm">
          {data.notes && <p><span className="font-bold text-slate-600">Notes:</span> {data.notes}</p>}
          {data.paymentTerms && <p><span className="font-bold text-slate-600">Terms:</span> {data.paymentTerms}</p>}
        </div>

        {customization.signatureDataUrl && (
          <div className="text-center shrink-0">
            <img src={customization.signatureDataUrl} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
            <p className="font-bold text-slate-700">{customization.signatureName || "Authorized Signatory"}</p>
            {customization.signatureTitle && <p className="text-[10px] text-slate-400">{customization.signatureTitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
