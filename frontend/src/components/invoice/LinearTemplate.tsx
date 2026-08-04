import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function LinearTemplate({ data, currencySymbol }: TemplateProps) {
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
    <div className="bg-[#fafafa] text-zinc-900 p-8 md:p-12 font-mono min-h-[800px] flex flex-col justify-between border-t-4 border-zinc-900">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start pb-8 border-b border-zinc-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
              // ISSUER
            </span>
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-10 max-w-[180px] object-contain mb-2"
              />
            ) : (
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
                {businessInfo.name || "YOUR COMPANY"}
              </h1>
            )}
            <div className="text-xs text-zinc-500 space-y-0.5 pt-1">
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.gstNumber && <p>TAX_ID: {businessInfo.gstNumber}</p>}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>INVOICE</span>
            </div>
            <div className="text-xs text-zinc-500 space-y-1 pt-2">
              <p><span className="text-zinc-400">ISSUED:</span> {data.invoiceDate || "—"}</p>
              <p><span className="text-zinc-400">PAY_DUE:</span> {data.dueDate || "—"}</p>
            </div>
          </div>
        </div>

        {/* Client Meta */}
        <div className="my-8 p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
              // RECIPIENT
            </span>
            <p className="font-bold text-zinc-900 text-sm font-sans">{clientInfo.name || "Client Name"}</p>
            <div className="text-xs text-zinc-500 space-y-0.5 mt-1">
              {clientInfo.address && <p>{clientInfo.address}</p>}
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.gstNumber && <p>TAX_ID: {clientInfo.gstNumber}</p>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden mb-8 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">ITEM / SERVICE</th>
                <th className="py-3 px-4 text-center">QTY</th>
                <th className="py-3 px-4 text-right">UNIT_PRICE</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold font-sans text-zinc-900">{item.name || "Item title"}</p>
                    {item.description && <p className="text-[11px] text-zinc-400 font-normal mt-0.5 font-sans">{item.description}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-center text-zinc-600">{item.quantity || 0}</td>
                  <td className="py-3.5 px-4 text-right text-zinc-600">
                    {currencySymbol}{(item.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-zinc-900">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Box */}
        <div className="flex justify-end mb-8">
          <div className="w-80 p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>SUBTOTAL</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>DISCOUNT</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {shippingAmount > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>SHIPPING</span>
                <span>+{currencySymbol}{shippingAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>TAX ({calculations.taxType} {calculations.taxRate}%)</span>
                <span>+{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-zinc-900">
              <span>BALANCE_DUE</span>
              <span className="text-base text-blue-600">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-end gap-6 text-xs text-zinc-400">
        <div className="space-y-1 max-w-sm">
          {data.notes && <p><span className="font-bold text-zinc-600">// NOTES:</span> {data.notes}</p>}
          {data.paymentTerms && <p><span className="font-bold text-zinc-600">// TERMS:</span> {data.paymentTerms}</p>}
        </div>

        {customization.signatureDataUrl && (
          <div className="text-center shrink-0">
            <img src={customization.signatureDataUrl} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
            <p className="font-bold text-zinc-800 font-sans">{customization.signatureName || "Authorized Signatory"}</p>
            {customization.signatureTitle && <p className="text-[10px] text-zinc-400 font-sans">{customization.signatureTitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
