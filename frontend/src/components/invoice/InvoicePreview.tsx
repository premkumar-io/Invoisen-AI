import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import type { InvoiceForm } from "./InvoiceEditor";

interface InvoicePreviewProps {
  data: InvoiceForm;
  templateId: string;
  currencySymbol: string;
}

const templates: Record<
  string,
  React.ComponentType<{ data: InvoiceForm; currencySymbol: string }>
> = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  corporate: CorporateTemplate,
  elegant: ElegantTemplate,
};

export function InvoicePreview({ data, templateId, currencySymbol }: InvoicePreviewProps) {
  const TemplateComponent = templates[templateId] ?? ModernTemplate;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg h-full overflow-y-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <TemplateComponent data={data} currencySymbol={currencySymbol} />
      </div>
    </div>
  );
}
