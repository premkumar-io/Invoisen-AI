import fs from 'node:fs';
import type { IInvoice } from '../modules/invoices/invoice.model.js';

function formatDate(d: Date | string | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function baseStyles(invoice: IInvoice): string {
  const c = invoice.customization;
  return `
    * { box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 0; background: #fff; color: #1f2937; }
    .page { padding: 40px; width: 100%; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .brand { font-size: 1.5em; font-weight: bold; color: ${c.themeColor}; margin: 0 0 8px 0; }
    .logo { max-height: 60px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { background: ${c.themeColor}; color: #fff; text-align: left; padding: 10px; font-size: 0.9em; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-top: 16px; text-align: right; }
    .totals div { margin: 4px 0; }
    .total-row { font-size: 1.2em; font-weight: bold; color: ${c.themeColor}; }
    .signature { margin-top: 40px; }
    .signature img { max-height: 80px; }
  `;
}

function itemsTable(invoice: IInvoice): string {
  const currency = invoice.customization.currency;
  const rows = invoice.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}<br/><small>${item.description}</small></td>
        <td>${item.quantity}</td>
        <td>${formatMoney(item.rate, currency)}</td>
        <td>${formatMoney(item.amount, currency)}</td>
      </tr>`
    )
    .join('');

  return `
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function totalsBlock(invoice: IInvoice): string {
  const c = invoice.calculations;
  const cur = invoice.customization.currency;
  return `
    <div class="totals">
      <div>Subtotal: ${formatMoney(c.subtotal, cur)}</div>
      ${c.discount > 0 ? `<div>Discount: -${formatMoney(c.discount, cur)}</div>` : ''}
      ${c.taxType !== 'None' ? `<div>${c.taxType} (${c.taxRate}%): ${formatMoney(c.taxAmount, cur)}</div>` : ''}
      <div class="total-row">Total: ${formatMoney(c.total, cur)}</div>
    </div>
  `;
}

function signatureBlock(invoice: IInvoice): string {
  if (!invoice.customization.signatureDataUrl) return '';
  return `<div class="signature"><p>Signature:</p><img src="${invoice.customization.signatureDataUrl}" alt="Signature"/></div>`;
}

function modernTemplate(invoice: IInvoice): string {
  const b = invoice.businessInfo;
  const cl = invoice.clientInfo;
  const logo = b.logoUrl ? `<img class="logo" src="${b.logoUrl}" alt="Logo"/>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${baseStyles(invoice)}
    .header { border-bottom: 3px solid ${invoice.customization.themeColor}; padding-bottom: 16px; }
    .invoice-title { font-size: 2em; font-weight: 700; }
  </style></head><body><div class="page">
    <div class="header">
      <div>${logo}<h1 class="brand">${b.name}</h1><p>${b.address}</p><p>${b.email} · ${b.phone}</p></div>
      <div><div class="invoice-title">INVOICE</div><p><strong>${invoice.invoiceNumber}</strong></p><p>Date: ${formatDate(invoice.invoiceDate)}</p><p>Due: ${formatDate(invoice.dueDate)}</p></div>
    </div>
    <p><strong>Bill To:</strong> ${cl.name}<br/>${cl.address}<br/>${cl.email}</p>
    ${itemsTable(invoice)}${totalsBlock(invoice)}${signatureBlock(invoice)}
  </div></body></html>`;
}

function corporateTemplate(invoice: IInvoice): string {
  const b = invoice.businessInfo;
  const cl = invoice.clientInfo;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${baseStyles(invoice)}
    .header { background: ${invoice.customization.themeColor}; color: #fff; padding: 20px; margin: -20mm -20mm 24px -20mm; }
    .header * { color: #fff !important; }
    .grid { display: flex; gap: 40px; margin-bottom: 20px; }
  </style></head><body><div class="page">
    <div class="header"><h1>${b.name}</h1><p>Invoice ${invoice.invoiceNumber}</p></div>
    <div class="grid">
      <div><strong>From</strong><br/>${b.address}<br/>${b.email}</div>
      <div><strong>To</strong><br/>${cl.name}<br/>${cl.address}</div>
      <div><strong>Dates</strong><br/>Issued: ${formatDate(invoice.invoiceDate)}<br/>Due: ${formatDate(invoice.dueDate)}</div>
    </div>
    ${itemsTable(invoice)}${totalsBlock(invoice)}${signatureBlock(invoice)}
  </div></body></html>`;
}

function minimalTemplate(invoice: IInvoice): string {
  const b = invoice.businessInfo;
  const cl = invoice.clientInfo;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${baseStyles(invoice)}
    th { background: transparent; color: ${invoice.customization.themeColor}; border-bottom: 2px solid ${invoice.customization.themeColor}; }
    td { border: none; border-bottom: 1px solid #eee; }
  </style></head><body><div class="page">
    <h2>${b.name}</h2><p>${invoice.invoiceNumber} · ${formatDate(invoice.invoiceDate)}</p>
    <p>To: ${cl.name} (${cl.email})</p>
    ${itemsTable(invoice)}${totalsBlock(invoice)}${signatureBlock(invoice)}
  </div></body></html>`;
}

function creativeTemplate(invoice: IInvoice): string {
  const b = invoice.businessInfo;
  const cl = invoice.clientInfo;
  const accent = invoice.customization.themeColor;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${baseStyles(invoice)}
    .page { border-left: 8px solid ${accent}; }
    .badge { display: inline-block; background: ${accent}; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    th { border-radius: 4px; }
  </style></head><body><div class="page">
    <span class="badge">${invoice.status.toUpperCase()}</span>
    <div class="header"><div><h1 class="brand">${b.name}</h1></div><div><h2>${invoice.invoiceNumber}</h2></div></div>
    <p><strong>${cl.name}</strong> · ${cl.email}</p>
    <p>Due ${formatDate(invoice.dueDate)}</p>
    ${itemsTable(invoice)}${totalsBlock(invoice)}${signatureBlock(invoice)}
  </div></body></html>`;
}

const templates: Record<string, (invoice: IInvoice) => string> = {
  modern: modernTemplate,
  corporate: corporateTemplate,
  minimal: minimalTemplate,
  creative: creativeTemplate,
};

export function renderInvoiceHtml(invoice: IInvoice): string {
  const templateId = invoice.customization.templateId || 'modern';
  const render = templates[templateId] ?? modernTemplate;
  return render(invoice);
}

function findSystemChrome(): string | undefined {
  const possiblePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

export async function generateInvoicePdf(invoice: IInvoice): Promise<Buffer> {
  const puppeteer = await import('puppeteer');
  const { env } = await import('../config/env.js');
  const html = renderInvoiceHtml(invoice);

  const executablePath =
    env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    findSystemChrome();

  let browser;
  try {
    browser = await puppeteer.default.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (firstErr) {
    try {
      browser = await puppeteer.default.launch({
        headless: true,
        channel: 'chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    } catch {
      throw firstErr;
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
