import type { ClientAutofillInput, GenerateDescriptionInput, TaxSuggestionInput } from './ai.schema.js';
import type { InvoiceAssistInput } from './ai.schema.js';

function extract(prompt: string, regex: RegExp): string | null {
  const match = prompt.match(regex);
  return match ? match[1] ?? match[0] : null;
}

export function createInvoiceSuggestions(input: InvoiceAssistInput) {
  const prompt = input.prompt;
  let currency = input.currency || 'USD';

  // --- Entity Extraction ---
  // Improved regex to capture client names more flexibly, not just corporate names.
  // It looks for text after "for", "to", or "bill" and stops before other keywords.
  const clientNameMatch = extract(prompt, /(?:for|to|bill)\s+([\w\s.,-]+?)(?=\s+for\s|\sworth\s|\sdue\s|,|$)/i);
  const clientName = clientNameMatch
    ? clientNameMatch.trim()
    : input.clientName || '';

  const currencySymbolMatch = prompt.match(/(₹|[$€£])/i);
  if (currencySymbolMatch) {
    const symbol = currencySymbolMatch[1];
    if (symbol === '₹') currency = 'INR';
    else if (symbol === '$') currency = 'USD';
    else if (symbol === '€') currency = 'EUR';
    else if (symbol === '£') currency = 'GBP';
  }

  const amountMatch = prompt.match(/(?:worth|for|of)\s*(?:[₹$€£]\s?)?([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch && amountMatch[1] ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // Check for "inclusive" or "exclusive" to better interpret the amount.
  const isTaxInclusive = !/plus tax|plus gst|exclusive of/i.test(prompt);
  const taxMatch = prompt.match(/(\d{1,2}(?:\.\d{1,2})?)\s?%\s?(gst|vat|tax)/i);
  const taxRate = taxMatch && taxMatch[1] ? parseFloat(taxMatch[1]) : 0;
  const taxType = taxMatch && taxMatch[2] ? (taxMatch[2].toUpperCase() as 'GST' | 'VAT') : 'None';

  const dueDateMatch = extract(prompt, /due\s(in\s\d+\s\w+|tomorrow|next\sweek)/i);
  let dueDate = new Date(Date.now() + 14 * 864e5); // Default: 2 weeks
  if (dueDateMatch) {
    const DAY_IN_MS = 864e5;
    const lowerDueDateMatch = dueDateMatch.toLowerCase();
    if (lowerDueDateMatch.includes('tomorrow')) {
      dueDate = new Date(Date.now() + DAY_IN_MS);
    } else if (lowerDueDateMatch.includes('next week')) {
      dueDate = new Date(Date.now() + 7 * DAY_IN_MS);
    } else {
      const daysMatch = lowerDueDateMatch.match(/in\s(\d+)\sday/i);
      if (daysMatch && daysMatch[1]) dueDate = new Date(Date.now() + parseInt(daysMatch[1], 10) * DAY_IN_MS);
      const weeksMatch = lowerDueDateMatch.match(/in\s(\d+)\sweek/i);
      if (weeksMatch && weeksMatch[1]) dueDate = new Date(Date.now() + parseInt(weeksMatch[1], 10) * 7 * DAY_IN_MS);
    }
  }

  // Improved regex to capture a wider variety of services instead of a fixed list.
  const itemNameMatch = extract(
    prompt,
    /for\s+([\w\s-]+?)(?=\s+worth\s|\sdue\s|,|$)/i
  );
  const itemName = itemNameMatch || 'Professional Services';

  // --- Response Assembly ---
  const subtotal = taxRate > 0 && isTaxInclusive ? amount / (1 + taxRate / 100) : amount;

  const items =
    amount > 0
      ? [
          {
            name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
            description: `As per project discussion and agreement.`,
            quantity: 1,
            rate: Math.round(subtotal),
          },
        ]
      : [
          {
            name: 'Professional Services',
            description: '',
            quantity: 1,
            rate: 0,
          },
        ];

  return {
    suggestions: {
      clientInfo: {
        name: clientName
          .replace(/pvt\s?ltd/i, 'Pvt Ltd')
          .replace(/llc/i, 'LLC')
          .replace(/inc/i, 'Inc')
          .replace(/corp/i, 'Corp'),
      },
      currency,
      items,
      calculations: {
        taxRate,
        taxType,
      },
      dueDate: dueDate.toISOString().slice(0, 10),
      notes: 'Thank you for your business. Please review the invoice details and complete payment by the due date.',
      paymentTerms: 'Payment is due within 15 days. Late payments may be subject to a reasonable follow-up fee where permitted.',
    },
    meta: {
      followUpMessage: `Hi ${
        clientName || 'there'
      }, sharing the invoice for the completed work. Please let me know if you need any changes.`,
      qualityChecklist: [
        'Client name and email are present',
        'Every line item has a clear deliverable',
        'Tax, discount, and total are separated',
        'Payment terms are included',
        'Signature details are configured',
      ],
    },
  };
}

function getRandomItem<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot get a random item from an empty array');
  }
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex]!;
}

export function createDescriptionSuggestion(input: GenerateDescriptionInput) {
  const { productName } = input;
  const productLower = productName.toLowerCase();

  const templates = {
    develop: [
      `Development and implementation of the ${productName} project, including all associated tasks and deliverables as per our agreement.`,
      `Custom software development for ${productName}, covering front-end and back-end implementation as specified.`,
      `Engineering services for the ${productName} build, from initial architecture to final deployment.`,
    ],
    design: [
      `Creative design services for ${productName}, covering all phases from concept to final visual delivery.`,
      `Comprehensive UI/UX design for ${productName}, including wireframing, mockups, and prototyping.`,
      `Visual identity and branding design for ${productName}, delivering a complete style guide and assets.`,
    ],
    consult: [
      `Strategic consulting services for ${productName}, providing expert advice and guidance as per our statement of work.`,
      `Expert advisory and consultation for the ${productName} initiative, focused on achieving key business objectives.`,
      `Professional guidance and strategic planning for ${productName}, as detailed in our service agreement.`,
    ],
    retainer: [
      `Monthly retainer for ongoing professional services related to ${productName} for the period of [Month, Year].`,
      `Ongoing support and advisory services for ${productName} under our monthly retainer agreement.`,
    ],
    website: [
      `Full-stack development and deployment of the ${productName}, meeting all specified requirements.`,
      `Design and development of the responsive ${productName}, optimized for performance and user experience.`,
    ],
    logo: [
      `Creation of a unique logo for ${productName}, including brand identity concepts and final asset delivery.`,
      `Brand identity design, focusing on the creation of a memorable and effective logo for ${productName}.`,
    ],
    default: [
      `Completed work for ${productName} as per our discussion and agreement, delivered on [Date].`,
      `Provision of professional services related to ${productName}, successfully delivered.`,
      `Execution and delivery of all services for ${productName} as outlined in our project scope.`,
      `Professional services rendered for ${productName} as per the agreed-upon statement of work.`,
    ],
  };

  let description = getRandomItem(templates.default);

  if (productLower.includes('develop')) {
    description = getRandomItem(templates.develop);
  } else if (productLower.includes('design')) {
    description = getRandomItem(templates.design);
  } else if (productLower.includes('consult')) {
    description = getRandomItem(templates.consult);
  } else if (productLower.includes('retainer')) {
    description = getRandomItem(templates.retainer);
  } else if (productLower.includes('website')) {
    description = getRandomItem(templates.website);
  } else if (productLower.includes('logo')) {
    description = getRandomItem(templates.logo);
  }

  return {
    description,
  };
}

interface TaxInfo {
  taxType: 'GST' | 'VAT' | 'Sales Tax' | 'None';
  rate: number;
  description: string;
}

// This is a simplified "AI" service. In a real-world scenario, this could be
// a call to a more complex model or a comprehensive tax database API.
const taxRules: Record<string, TaxInfo> = {
  // Commonwealth
  IN: { taxType: 'GST', rate: 18, description: 'The standard GST rate for most services in India is 18%.' },
  AU: { taxType: 'GST', rate: 10, description: 'The standard GST rate in Australia is 10%.' },
  CA: { taxType: 'GST', rate: 5, description: 'The federal GST rate in Canada is 5%. Provincial Sales Tax (PST) or Harmonized Sales Tax (HST) may also apply depending on the province.' },
  GB: { taxType: 'VAT', rate: 20, description: 'The standard VAT rate in the United Kingdom is 20%.' },
  // EU
  DE: { taxType: 'VAT', rate: 19, description: 'The standard VAT rate (Umsatzsteuer) in Germany is 19%.' },
  FR: { taxType: 'VAT', rate: 20, description: 'The standard VAT rate (TVA) in France is 20%.' },
  // US
  US: { taxType: 'Sales Tax', rate: 0, description: 'Sales tax in the US varies by state and locality. It is often not applied to service invoices. Please check local regulations and apply the correct rate if required.' },
  // Default
  DEFAULT: { taxType: 'None', rate: 0, description: 'Could not determine a standard tax for the selected country. Please check local regulations.' },
};

/**
 * Generates a tax suggestion based on the user's country.
 * @param input - Contains the country code.
 * @returns A suggested tax type, rate, and a descriptive message.
 */
export function createTaxSuggestion(input: TaxSuggestionInput): TaxInfo {
  const { country } = input;
  const rule = taxRules[country.toUpperCase()];
  if (rule) return rule;
  return taxRules.DEFAULT as TaxInfo;
}

interface ClientSuggestion {
  name: string;
  email: string;
  address: string;
  phone: string;
  gstNumber: string;
  company: string;
}

// This is a simplified "AI" service. In a real-world scenario, this could be
// a call to a 3rd party data enrichment API like Clearbit or a local database.
const clientRules: Record<string, ClientSuggestion> = {
  "ACME": { name: "Acme Corporation", email: "billing@acme.com", address: "123 Main Street, San Francisco, CA 94105, USA", phone: "415-555-1234", gstNumber: "", company: "Acme Corporation" },
  "NEXUS": { name: "Nexus Labs Inc.", email: "accounts@nexuslabs.io", address: "456 Innovation Drive, Bengaluru, KA 560001, India", phone: "+91 80 5555 6789", gstNumber: "29AABCU9539R1Z5", company: "Nexus Labs Inc." },
  "VORTEX": { name: "Vortex Tech", email: "pay@vortex.tech", address: "789 Future Way, London, SW1A 0AA, UK", phone: "+44 20 7946 0958", gstNumber: "GB123456789", company: "Vortex Tech" },
  "STRIPE": { name: "Stripe", email: "support@stripe.com", address: "510 Townsend Street, San Francisco, CA 94103, USA", phone: "1-888-926-2289", gstNumber: "", company: "Stripe, Inc." },
};

/**
 * Generates client profile suggestions based on a name or email query.
 * @param input - Contains the query string.
 * @returns An array of matching client suggestions.
 */
export function createClientSuggestion(input: ClientAutofillInput): ClientSuggestion[] {
  const { query } = input;
  const queryUpper = query.toUpperCase();

  const keys = Object.keys(clientRules) as Array<keyof typeof clientRules>;
  return keys
    .filter((key) => {
      const client = clientRules[key] as ClientSuggestion;
      return key.includes(queryUpper) || client.email.toUpperCase().includes(queryUpper);
    })
    .map((key) => clientRules[key] as ClientSuggestion);
}

/**
 * Mocks sending an invoice email.
 * In a real implementation, this would:
 * 1. Fetch the invoice from the database to ensure ownership.
 * 2. Generate the invoice PDF using a service like Puppeteer.
 * 3. Use an email service (e.g., Resend) to send an email with the PDF attachment.
 * 4. Update the invoice status to 'published' and set a 'lastSentAt' timestamp.
 * @param invoiceId - The ID of the invoice to send.
 * @param userId - The ID of the user sending the invoice.
 * @returns A confirmation message.
 */
export async function sendInvoiceByEmail(invoiceId: string, userId: string): Promise<{ message: string }> {
  // Mock logic: In a real app, you'd have DB interaction here.
  console.log(`User ${userId} is sending invoice ${invoiceId}.`);
  // Simulate a delay for email sending
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: 'The invoice email has been queued for sending.' };
}
