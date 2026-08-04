import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { CyberTemplate } from "./CyberTemplate";
import { StripeTemplate } from "./StripeTemplate";
import { LinearTemplate } from "./LinearTemplate";
import { AppleTemplate } from "./AppleTemplate";
import { NordicTemplate } from "./NordicTemplate";
import { BrutalistTemplate } from "./BrutalistTemplate";
import { EmeraldTemplate } from "./EmeraldTemplate";
import type { InvoiceForm } from "./InvoiceEditor";

interface InvoicePreviewProps {
  data: InvoiceForm;
  templateId: string;
  currencySymbol: string;
  hideOuterWrapper?: boolean;
  className?: string;
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
  cyber: CyberTemplate,
  stripe: StripeTemplate,
  linear: LinearTemplate,
  apple: AppleTemplate,
  nordic: NordicTemplate,
  brutalist: BrutalistTemplate,
  emerald: EmeraldTemplate,
};

export function InvoicePreview({
  data,
  templateId,
  currencySymbol,
  hideOuterWrapper = false,
  className = "",
}: InvoicePreviewProps) {
  const TemplateComponent = templates[templateId] ?? ModernTemplate;

  if (hideOuterWrapper) {
    return (
      <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
        <TemplateComponent data={data} currencySymbol={currencySymbol} />
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 dark:bg-gray-900 p-4 rounded-lg h-full overflow-y-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg">
        <TemplateComponent data={data} currencySymbol={currencySymbol} />
      </div>
    </div>
  );
}
