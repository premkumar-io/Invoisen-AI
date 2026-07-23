import type { InvoiceForm } from "./InvoiceEditor";

interface TemplateProps {
  data: InvoiceForm;
  currencySymbol: string;
}

export function ProfessionalTemplate({ data, currencySymbol }: TemplateProps) {
  const subtotal = data.items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0,
  );
  const discountAmount = data.calculations.discount || 0;
  const shippingAmount = data.calculations.shipping || 0;
  const taxAmount = (subtotal - discountAmount) * ((data.calculations.taxRate || 0) / 100);
  const total = subtotal - discountAmount + taxAmount + shippingAmount;

  return (
    <div className="bg-white text-gray-800 p-10 font-serif">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b-4 border-gray-700">
        <div>
          {data.businessInfo.logoUrl ? (
            <img
              src={data.businessInfo.logoUrl}
              alt="Company Logo"
              className="h-16 max-w-56 object-contain mb-4"
            />
          ) : (
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{data.businessInfo.name}</h1>
          )}
          <p className="text-sm text-gray-600">{data.businessInfo.address}</p>
          <p className="text-sm text-gray-600">{data.businessInfo.email}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase text-gray-600">Invoice</h2>
          <p className="text-sm mt-2">
            <span className="font-semibold">#</span>
            {data.invoiceNumber}
          </p>
        </div>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="font-semibold text-gray-700">BILL TO</p>
          <p className="font-bold text-lg">{data.clientInfo.name}</p>
          <p>{data.clientInfo.address}</p>
          <p>{data.clientInfo.email}</p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-semibold">Invoice Date:</span> {data.invoiceDate}
          </p>
          <p>
            <span className="font-semibold">Due Date:</span> {data.dueDate}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 text-left font-semibold text-gray-700">Item</th>
            <th className="p-2 text-right font-semibold text-gray-700">Qty</th>
            <th className="p-2 text-right font-semibold text-gray-700">Rate</th>
            <th className="p-2 text-right font-semibold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-2 border-r border-gray-200">{item.name}</td>
              <td className="p-2 text-right border-r border-gray-200">{item.quantity}</td>
              <td className="p-2 text-right border-r border-gray-200">
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
        <div className="w-1/3 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
          {shippingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>
                {currencySymbol}
                {shippingAmount.toFixed(2)}
              </span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span>
                -{currencySymbol}
                {discountAmount.toFixed(2)}
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
          <div className="border-t-2 border-gray-700 my-2"></div>
          <div className="flex justify-between font-bold text-xl">
            <span className="text-gray-800">TOTAL</span>
            <span>
              {currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-4 border-t text-sm text-gray-600">
        {data.customization?.signatureDataUrl && (
          <div className="mb-8">
            <img src={data.customization.signatureDataUrl} alt="Signature" className="h-16" />
            <p className="font-semibold mt-2">{data.customization.signatureName}</p>
            <p>{data.customization.signatureTitle}</p>
          </div>
        )}
        {data.notes && (
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Notes</h4>
            <p>{data.notes}</p>
          </div>
        )}
        {data.paymentTerms && (
          <div>
            <h4 className="font-semibold mb-1">Payment Terms</h4>
            <p>{data.paymentTerms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
