import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function MinimalTemplate({ data, currencySymbol }: TemplateProps) {
  const subtotal = data.items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = data.calculations.discount || 0;
  const shippingAmount = data.calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((data.calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-gray-700 p-10 font-hanken">
      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          {data.businessInfo.logoUrl ? (
            <img
              src={data.businessInfo.logoUrl}
              alt="Company Logo"
              className="h-10 max-w-40 object-contain"
            />
          ) : (
            <h1 className="text-xl font-bold tracking-wider uppercase">{data.businessInfo.name}</h1>
          )}
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>{data.businessInfo.address}</p>
          <p>{data.businessInfo.email}</p>
        </div>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-3 gap-4 mb-16">
        <div className="col-span-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Billed To</p>
          <p className="text-lg font-semibold">{data.clientInfo.name}</p>
          <p className="text-sm text-gray-600">{data.clientInfo.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">INVOICE</h2>
          <p className="text-sm text-gray-600">{data.invoiceNumber}</p>
          <p className="mt-4 text-xs text-gray-500">Date: {data.invoiceDate}</p>
          <p className="text-xs text-gray-500">Due: {data.dueDate}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-16 text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="p-2 text-left font-semibold uppercase tracking-wider">Description</th>
            <th className="p-2 text-right font-semibold uppercase tracking-wider">Qty</th>
            <th className="p-2 text-right font-semibold uppercase tracking-wider">Rate</th>
            <th className="p-2 text-right font-semibold uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-2">{item.name}</td>
              <td className="p-2 text-right">{item.quantity}</td>
              <td className="p-2 text-right">
                {currencySymbol}
                {item.rate.toFixed(2)}
              </td>
              <td className="p-2 text-right">
                {currencySymbol}
                {(item.quantity * item.rate).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
          {shippingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">
                {currencySymbol}
                {shippingAmount.toFixed(2)}
              </span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="font-medium">
                -{currencySymbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({data.calculations.taxRate}%)</span>
              <span className="font-medium">
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between font-bold text-base">
            <span className="uppercase">Total</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-xs text-gray-500">
        {data.customization?.signatureDataUrl && (
          <div className="mb-8">
            <img src={data.customization.signatureDataUrl} alt="Signature" className="h-12" />
            <p className="font-semibold mt-2 text-gray-700">{data.customization.signatureName}</p>
            <p>{data.customization.signatureTitle}</p>
          </div>
        )}
        {data.notes && <p className="mb-2">{data.notes}</p>}
        {data.paymentTerms && <p className="font-semibold">{data.paymentTerms}</p>}
      </div>
    </div>
  );
}
