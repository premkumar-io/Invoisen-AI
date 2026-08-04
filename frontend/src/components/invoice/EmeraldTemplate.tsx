import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function EmeraldTemplate({ data, currencySymbol }: TemplateProps) {
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
    <div className="bg-white text-emerald-950 p-8 md:p-12 font-sans min-h-[800px] flex flex-col justify-between border-t-8 border-emerald-800">
      <div>
        {/* Emerald Header */}
        <div className="flex justify-between items-start pb-8 border-b border-emerald-100">
          <div className="space-y-1">
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-12 max-w-[200px] object-contain mb-3"
              />
            ) : (
              <h1 className="text-2xl font-serif font-bold text-emerald-900 tracking-wide uppercase">
                {businessInfo.name || "YOUR COMPANY"}
              </h1>
            )}
            <div className="text-xs text-emerald-800 space-y-0.5 font-normal">
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.gstNumber && <p className="font-mono text-emerald-700">GST/Tax: {businessInfo.gstNumber}</p>}
            </div>
          </div>

          <div className="text-right space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-900 text-emerald-100 font-mono text-xs font-bold uppercase tracking-wider shadow-sm">
              TAX INVOICE
            </span>
            <div className="text-xs text-emerald-800 space-y-1 font-mono pt-1">
              <p><span className="font-bold text-emerald-900">Date:</span> {data.invoiceDate || "—"}</p>
              <p><span className="font-bold text-emerald-900">Due:</span> {data.dueDate || "—"}</p>
            </div>
          </div>
        </div>

        {/* Billed To Box */}
        <div className="my-8 p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 block mb-1">
              Billed To Client
            </span>
            <h2 className="font-bold text-emerald-950 text-sm font-serif">{clientInfo.name || "Client Name"}</h2>
            <div className="text-xs text-emerald-800 space-y-0.5 mt-1">
              {clientInfo.address && <p>{clientInfo.address}</p>}
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.gstNumber && <p className="font-mono">GST/Tax: {clientInfo.gstNumber}</p>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 mb-8 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-900 text-emerald-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 bg-white">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-emerald-950 font-serif">{item.name || "Item title"}</p>
                    {item.description && <p className="text-[11px] text-emerald-700 font-normal mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-800">{item.quantity || 0}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-800">
                    {currencySymbol}{(item.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-emerald-800 py-1 font-mono">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 py-1 font-mono font-medium">
                <span>Discount</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {shippingAmount > 0 && (
              <div className="flex justify-between text-emerald-800 py-1 font-mono">
                <span>Shipping</span>
                <span>+{currencySymbol}{shippingAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-emerald-800 py-1 font-mono">
                <span>Tax ({calculations.taxType} {calculations.taxRate}%)</span>
                <span>+{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-900 text-emerald-50 font-bold text-sm mt-3 shadow-md">
              <span className="font-serif">Total Payable</span>
              <span className="font-mono text-base">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-emerald-100 flex flex-col md:flex-row justify-between items-end gap-6 text-xs text-emerald-700">
        <div className="space-y-1 max-w-sm">
          {data.notes && <p><span className="font-bold text-emerald-900">Notes:</span> {data.notes}</p>}
          {data.paymentTerms && <p><span className="font-bold text-emerald-900">Terms:</span> {data.paymentTerms}</p>}
        </div>

        {customization.signatureDataUrl && (
          <div className="text-center shrink-0">
            <img src={customization.signatureDataUrl} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
            <p className="font-bold text-emerald-950 font-serif">{customization.signatureName || "Authorized Signatory"}</p>
            {customization.signatureTitle && <p className="text-[10px] text-emerald-600">{customization.signatureTitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
