import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function ElegantTemplate({ data, currencySymbol }: TemplateProps) {
  const subtotal = data.items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = data.calculations.discount || 0;
  const shippingAmount = data.calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((data.calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-gray-700 p-12 font-serif">
      {/* Header */}
      <div className="text-center mb-16">
        {data.businessInfo.logoUrl ? (
          <img
            src={data.businessInfo.logoUrl}
            alt="Company Logo"
            className="h-16 max-w-56 object-contain mx-auto mb-4"
          />
        ) : (
          <h1 className="text-4xl font-thin tracking-widest uppercase">{data.businessInfo.name}</h1>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {data.businessInfo.address} &bull; {data.businessInfo.email}
        </p>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-light tracking-wider">INVOICE</h2>
        <p className="text-sm text-gray-500 mt-2">{data.invoiceNumber}</p>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-2 gap-8 mb-12 pb-8 border-b border-gray-200">
        <div className="text-left">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Billed To</p>
          <p className="text-lg font-semibold mt-1">{data.clientInfo.name}</p>
          <p className="text-sm">{data.clientInfo.address}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Date Issued: <span className="font-medium text-gray-800">{data.invoiceDate}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Date Due: <span className="font-medium text-gray-800">{data.dueDate}</span>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12 text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="pb-3 text-left font-normal uppercase tracking-wider text-gray-500">
              Service
            </th>
            <th className="pb-3 text-right font-normal uppercase tracking-wider text-gray-500">
              Qty
            </th>
            <th className="pb-3 text-right font-normal uppercase tracking-wider text-gray-500">
              Rate
            </th>
            <th className="pb-3 text-right font-normal uppercase tracking-wider text-gray-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td className="py-3">{item.name}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">
                {currencySymbol}
                {item.rate.toFixed(2)}
              </td>
              <td className="py-3 text-right">
                {currencySymbol}
                {(item.quantity * item.rate).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/3 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
          {shippingAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>
                {currencySymbol}
                {shippingAmount.toFixed(2)}
              </span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span>
                -{currencySymbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({data.calculations.taxRate}%)</span>
              <span>
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between font-bold text-xl">
            <span className="font-normal">Amount Due</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-10 border-t border-gray-200">
        {data.customization?.signatureDataUrl && (
          <div className="mb-8">
            <img src={data.customization.signatureDataUrl} alt="Signature" className="h-14" />
            <p className="font-semibold mt-2 text-sm">{data.customization.signatureName}</p>
            <p className="text-xs text-gray-500">{data.customization.signatureTitle}</p>
          </div>
        )}
        <div className="text-xs text-gray-500">
          {data.notes && <p className="mb-2">{data.notes}</p>}
          {data.paymentTerms && <p>{data.paymentTerms}</p>}
        </div>
      </div>
    </div>
  );
}
