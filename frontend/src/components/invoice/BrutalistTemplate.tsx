import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function BrutalistTemplate({ data, currencySymbol }: TemplateProps) {
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
    <div className="bg-white text-black p-8 md:p-12 font-mono min-h-[800px] flex flex-col justify-between border-4 border-black">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start pb-8 border-b-4 border-black">
          <div>
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-12 max-w-[200px] object-contain mb-3"
              />
            ) : (
              <h1 className="text-3xl font-black tracking-tight text-black font-sans uppercase">
                {businessInfo.name || "YOUR STUDIO"}
              </h1>
            )}
            <div className="text-xs text-black font-medium space-y-0.5 mt-2">
              {businessInfo.address && <p>{businessInfo.address}</p>}
              {businessInfo.email && <p>{businessInfo.email}</p>}
              {businessInfo.gstNumber && <p className="font-bold">TAX: {businessInfo.gstNumber}</p>}
            </div>
          </div>

          <div className="text-right space-y-2">
            <span className="inline-block px-4 py-1.5 bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              INVOICE
            </span>
            <div className="text-xs text-black font-bold space-y-1 pt-2">
              <p>DATE: {data.invoiceDate || "—"}</p>
              <p>DUE: {data.dueDate || "—"}</p>
            </div>
          </div>
        </div>

        {/* Billed To Box */}
        <div className="my-8 p-5 bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-1">
            CLIENT / BILLED TO
          </span>
          <h2 className="font-black text-black text-base font-sans">{clientInfo.name || "Client Name"}</h2>
          <div className="text-xs text-black space-y-0.5 mt-1 font-medium">
            {clientInfo.address && <p>{clientInfo.address}</p>}
            {clientInfo.email && <p>{clientInfo.email}</p>}
            {clientInfo.gstNumber && <p className="font-bold">TAX: {clientInfo.gstNumber}</p>}
          </div>
        </div>

        {/* Table */}
        <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-black text-white font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">ITEM DESCRIPTION</th>
                <th className="py-3 px-4 text-center">QTY</th>
                <th className="py-3 px-4 text-right">RATE</th>
                <th className="py-3 px-4 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black bg-white">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-4">
                    <p className="font-black text-black font-sans">{item.name || "Item title"}</p>
                    {item.description && <p className="text-[11px] text-zinc-600 font-normal mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">{item.quantity || 0}</td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    {currencySymbol}{(item.rate || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black">
                    {currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="flex justify-end mb-8">
          <div className="w-80 p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 text-xs font-bold">
            <div className="flex justify-between text-black">
              <span>SUBTOTAL</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DISCOUNT</span>
                <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {shippingAmount > 0 && (
              <div className="flex justify-between text-black">
                <span>SHIPPING</span>
                <span>+{currencySymbol}{shippingAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-black">
                <span>TAX ({calculations.taxType} {calculations.taxRate}%)</span>
                <span>+{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t-2 border-black flex justify-between items-center text-sm font-black text-black bg-amber-300 p-2.5 -mx-2 -mb-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span>GRAND TOTAL</span>
              <span className="text-lg">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t-2 border-black flex flex-col md:flex-row justify-between items-end gap-6 text-xs text-black">
        <div className="space-y-1 max-w-sm font-medium">
          {data.notes && <p><span className="font-black">NOTES:</span> {data.notes}</p>}
          {data.paymentTerms && <p><span className="font-black">TERMS:</span> {data.paymentTerms}</p>}
        </div>

        {customization.signatureDataUrl && (
          <div className="text-center shrink-0">
            <img src={customization.signatureDataUrl} alt="Signature" className="h-10 mx-auto object-contain mb-1" />
            <p className="font-black font-sans">{customization.signatureName || "Authorized Signatory"}</p>
            {customization.signatureTitle && <p className="text-[10px] text-slate-600 font-sans">{customization.signatureTitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
