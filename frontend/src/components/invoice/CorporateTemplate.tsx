import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function CorporateTemplate({ data, currencySymbol }: TemplateProps) {
  const subtotal = data.items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = data.calculations.discount || 0;
  const shippingAmount = data.calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((data.calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-gray-900 p-10 font-sans">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 -mx-10 -mt-10 mb-10">
        <div className="flex justify-between items-center text-primary-foreground">
          <div>
            {data.businessInfo.logoUrl ? (
              <img
                src={data.businessInfo.logoUrl}
                alt="Company Logo"
                className="h-12 max-w-48 object-contain"
              />
            ) : (
              <h1 className="text-4xl font-bold">{data.businessInfo.name}</h1>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold uppercase">Invoice</h2>
            <p className="text-sm mt-1">{data.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        <div className="col-span-1">
          <p className="font-bold uppercase text-sm text-gray-500">Billed From</p>
          <p className="mt-2">{data.businessInfo.name}</p>
          <p className="text-sm text-gray-600">{data.businessInfo.address}</p>
          <p className="text-sm text-gray-600">{data.businessInfo.email}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold uppercase text-sm text-gray-500">Billed To</p>
          <p className="mt-2">{data.clientInfo.name}</p>
          <p className="text-sm text-gray-600">{data.clientInfo.address}</p>
          <p className="text-sm text-gray-600">{data.clientInfo.email}</p>
        </div>
        <div className="col-span-1 text-right">
          <p className="font-bold uppercase text-sm text-gray-500">Details</p>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Date:</span> {data.invoiceDate}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Due:</span> {data.dueDate}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="p-3 text-left font-semibold">Item Description</th>
            <th className="p-3 text-right font-semibold">Qty</th>
            <th className="p-3 text-right font-semibold">Rate</th>
            <th className="p-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b bg-gray-50">
              <td className="p-3">{item.name}</td>
              <td className="p-3 text-right">{item.quantity}</td>
              <td className="p-3 text-right">
                {currencySymbol}
                {item.rate.toFixed(2)}
              </td>
              <td className="p-3 text-right">
                {currencySymbol}
                {(item.quantity * item.rate).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-2/5">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                {currencySymbol}
                {subtotal.toFixed(2)}
              </span>
            </div>
            {shippingAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {shippingAmount.toFixed(2)}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold">
                  -{currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({data.calculations.taxRate}%)</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-bold text-lg">
              <span className="">Total Due</span>
              <span>
                {currencySymbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t text-xs text-gray-500 grid grid-cols-2 gap-8">
        <div>
          {data.notes && <p className="mb-2">{data.notes}</p>}
          {data.paymentTerms && <p className="font-semibold text-gray-600">{data.paymentTerms}</p>}
        </div>
        {data.customization?.signatureDataUrl && (
          <div className="text-right">
            <img
              src={data.customization.signatureDataUrl}
              alt="Signature"
              className="h-12 ml-auto"
            />
            <p className="font-semibold mt-2 text-gray-700">{data.customization.signatureName}</p>
            <p>{data.customization.signatureTitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}
