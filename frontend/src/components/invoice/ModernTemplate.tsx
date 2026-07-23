import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function ModernTemplate({ data, currencySymbol }: TemplateProps) {
  const subtotal = data.items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = data.calculations.discount || 0;
  const shippingAmount = data.calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((data.calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-gray-800 p-10 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          {data.businessInfo.logoUrl ? (
            <img
              src={data.businessInfo.logoUrl}
              alt="Company Logo"
              className="h-12 max-w-48 object-contain"
            />
          ) : (
            <h1 className="text-3xl font-bold text-primary uppercase">{data.businessInfo.name}</h1>
          )}
          <p className="text-gray-500 mt-2">Invoice</p>
        </div>
        <div className="text-right">
          <p>{data.businessInfo.address}</p>
          <p>{data.businessInfo.email}</p>
        </div>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div>
          <p className="font-bold text-gray-600">Billed To</p>
          <p>{data.clientInfo.name}</p>
          <p>{data.clientInfo.address}</p>
          <p>{data.clientInfo.email}</p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-bold">Invoice Date:</span> {data.invoiceDate}
          </p>
          <p>
            <span className="font-bold">Due Date:</span> {data.dueDate}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Quantity</th>
            <th className="p-3 text-right">Rate</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b">
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
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span>
                -{currencySymbol}
                {discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          {shippingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>
                {currencySymbol}
                {shippingAmount.toFixed(2)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({data.calculations.taxRate}%)</span>
              <span>
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t my-2"></div>
          <div className="flex justify-between font-bold text-lg text-primary">
            <span>Total</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t text-sm text-gray-500">
        {data.customization?.signatureDataUrl && (
          <div className="text-right">
            <img
              src={data.customization.signatureDataUrl}
              alt="Signature"
              className="h-16 ml-auto"
            />
            <p className="font-semibold mt-2 text-gray-800">{data.customization.signatureName}</p>
            <p>{data.customization.signatureTitle}</p>
          </div>
        )}
        {data.notes && <p className="mt-4">{data.notes}</p>}
        {data.paymentTerms && <p className="mt-2 font-semibold">{data.paymentTerms}</p>}
      </div>
    </div>
  );
}
