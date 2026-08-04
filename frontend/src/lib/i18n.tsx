import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

export type LanguageCode = "en" | "de" | "fr" | "es";

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav & Sidebar
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Invoices",
    "nav.clients": "Clients",
    "nav.products": "Catalog",
    "nav.reports": "Reports",
    "nav.trash": "Trash",
    "nav.settings": "Settings",
    "nav.support": "Support",
    "nav.createNew": "Create New",
    "nav.logout": "Log out",
    "nav.overview": "Overview",
    "nav.templates": "Templates",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.profileSettings": "My Profile & Settings",
    "nav.helpSupport": "Help & Support",
    "nav.aiWorkspace": "AI Workspace",

    // Settings Page
    "settings.title": "Workspace & Account Settings",
    "settings.subtitle": "Manage your user profile, business details, timezone, language and workspace defaults.",
    "settings.general": "General Profile Settings",
    "settings.timeZone": "Time Zone",
    "settings.language": "Language",
    "settings.saveChanges": "Save Workspace Changes",
    "settings.accountEmail": "Account Email",
    "settings.phoneNumber": "Phone Number",
    "settings.displayName": "Username",
    "settings.fullName": "Full Name",
    "settings.businessProfile": "Business Profile",
    "settings.invoiceDefaults": "Invoice Defaults",
    "settings.tabGeneral": "General & Profile",
    "settings.tabCompany": "Company & Branding",
    "settings.tabPayments": "Bank & Payout Details",
    "settings.tabAi": "AI Assistant & Automation",
    "settings.tabTaxes": "Taxes & Compliance",
    "settings.tabSecurity": "Security & Passwords",
    "settings.tabAppearance": "Appearance & Themes",
    "settings.tabNotifications": "Notifications & Alerts",
    "settings.tabSessions": "Active Sessions",
    "settings.tabApiKeys": "API Keys & Developer",
    "settings.tabData": "Data Export & Danger Zone",

    // Dashboard Page
    "dashboard.welcome": "Welcome back",
    "dashboard.totalBilled": "Total Revenue",
    "dashboard.collected": "Paid Invoices",
    "dashboard.outstanding": "Pending Balance",
    "dashboard.overdue": "Overdue Invoices",
    "dashboard.recentInvoices": "Recent Invoices",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.createInvoice": "Create New Invoice",
    "dashboard.revenueOverview": "Financial Revenue Performance",
    "dashboard.recentActivity": "Recent Activity Log",
    "dashboard.viewAllInvoices": "View All Invoices",
    "dashboard.addClient": "Add New Client",
    "dashboard.addItem": "Add Catalog Item",
    "dashboard.runAi": "Launch AI Generator",
    "dashboard.analytics": "Financial Analytics",
    "dashboard.analyticsSub": "Real-time revenue velocity & invoice distribution",
    "dashboard.revenueCurve": "Revenue Curve",
    "dashboard.invoiceStatus": "Invoice Status",
    "dashboard.aiIntelligence": "AI Intelligence",
    "dashboard.activeRecs": "Active Recommendations",
    "dashboard.sendReminderBtn": "Send AI Reminder Now",
    "dashboard.activityStream": "Live Activity Stream",
    "dashboard.realTime": "Real-Time",
    "dashboard.recentClients": "Recent Clients",
    "dashboard.viewAll": "View All →",
    "dashboard.billingCalendar": "Billing Calendar & Upcoming Payouts",
    "dashboard.stripeSync": "Stripe Sync Active",
    "dashboard.latestInvoices": "Latest Invoices",
    "dashboard.latestInvoicesSub": "Recent transactions across all clients",
    "dashboard.clientEntity": "Client Entity",

    // Invoices Page
    "invoices.title": "Invoices",
    "invoices.subtitle": "Manage, generate, track, and export your client billing invoices.",
    "invoices.invoiceNumber": "Invoice #",
    "invoices.client": "Client",
    "invoices.date": "Invoice Date",
    "invoices.dueDate": "Due Date",
    "invoices.amount": "Amount",
    "invoices.status": "Status",
    "invoices.paid": "Paid",
    "invoices.unpaid": "Unpaid",
    "invoices.draft": "Draft",
    "invoices.partiallyPaid": "Partially Paid",
    "invoices.overdue": "Overdue",
    "invoices.allStatus": "All Invoices",
    "invoices.createInvoice": "Create Invoice",
    "invoices.searchPlaceholder": "Search invoices by number or client name...",
    "invoices.noInvoices": "No invoices found matching your query.",
    "invoices.exportPdf": "Download PDF",

    // Clients Page
    "clients.title": "Clients",
    "clients.subtitle": "Manage your client profiles, billing contacts, and payment history.",
    "clients.addClient": "Add Client",
    "clients.search": "Search clients by name, email, or company...",
    "clients.name": "Client Name",
    "clients.email": "Email",
    "clients.phone": "Phone",
    "clients.company": "Company",
    "clients.totalBilled": "Total Billed",
    "clients.noClients": "No clients registered yet.",

    // Catalog Page
    "products.title": "Catalog & Services",
    "products.subtitle": "Maintain reusable products, services, and default pricing items.",
    "products.addProduct": "Add Item",
    "products.search": "Search catalog items or descriptions...",
    "products.itemName": "Item Name",
    "products.price": "Unit Price",
    "products.description": "Description",
    "products.noProducts": "No catalog items added yet.",

    // Reports Page
    "reports.title": "Financial Reports & Insights",
    "reports.subtitle": "Comprehensive breakdown of your revenue, payments, taxes, and cash flow.",
    "reports.export": "Export CSV / Data",
    "reports.totalRevenue": "Total Revenue",
    "reports.taxCollected": "Estimated Tax Collected",
    "reports.avgInvoice": "Average Invoice Value",
    "reports.monthlyTrend": "Monthly Revenue Trend",

    // Trash Page
    "trash.title": "Trash & Deleted Items",
    "trash.subtitle": "Recover accidentally deleted invoices or permanently erase items.",
    "trash.emptyTrash": "Empty Trash",
    "trash.restore": "Restore",
    "trash.noItems": "Trash is currently empty.",

    // Common UI Text
    "common.update": "Update",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.actions": "Actions",
    "common.verified": "Verified",
    "common.unverified": "Unverified",
    "common.loading": "Loading...",
    "common.language": "Language",
    "common.selectLanguage": "Select Language",
    "common.searchPlaceholder": "Search invoices...",
  },
  de: {
    // Nav & Sidebar
    "nav.dashboard": "Übersicht",
    "nav.invoices": "Rechnungen",
    "nav.clients": "Kunden",
    "nav.products": "Katalog",
    "nav.reports": "Berichte",
    "nav.trash": "Papierkorb",
    "nav.settings": "Einstellungen",
    "nav.support": "Support",
    "nav.createNew": "Neu erstellen",
    "nav.logout": "Abmelden",
    "nav.overview": "Überblick",
    "nav.templates": "Vorlagen",
    "nav.pricing": "Preise",
    "nav.faq": "FAQ",
    "nav.profileSettings": "Mein Profil & Einstellungen",
    "nav.helpSupport": "Hilfe & Support",
    "nav.aiWorkspace": "KI-Arbeitsbereich",

    // Settings Page
    "settings.title": "Einstellungen",
    "settings.subtitle": "Verwalten Sie Ihr Profil, Unternehmensdaten, Zeitzone, Sprache und Einstellungen.",
    "settings.general": "Allgemeine Profileinstellungen",
    "settings.timeZone": "Zeitzone",
    "settings.language": "Sprache",
    "settings.saveChanges": "Änderungen speichern",
    "settings.accountEmail": "Konto-E-Mail",
    "settings.phoneNumber": "Telefonnummer",
    "settings.displayName": "Anzeigename",
    "settings.fullName": "Vollständiger Name",
    "settings.businessProfile": "Unternehmensprofil",
    "settings.invoiceDefaults": "Rechnungsstandards",
    "settings.tabGeneral": "Allgemein & Profil",
    "settings.tabCompany": "Unternehmen & Branding",
    "settings.tabPayments": "Bank & Auszahlungen",
    "settings.tabAi": "KI-Assistent & Automation",
    "settings.tabTaxes": "Steuern & Compliance",
    "settings.tabSecurity": "Sicherheit & Passwörter",
    "settings.tabAppearance": "Erscheinungsbild & Themes",
    "settings.tabNotifications": "Benachrichtigungen",
    "settings.tabSessions": "Aktive Sitzungen",
    "settings.tabApiKeys": "API-Schlüssel & Entwickler",
    "settings.tabData": "Datenexport & Gefahrenbereich",

    // Dashboard Page
    "dashboard.welcome": "Willkommen zurück",
    "dashboard.totalBilled": "Gesamteinnahmen",
    "dashboard.collected": "Bezahlte Rechnungen",
    "dashboard.outstanding": "Offener Betrag",
    "dashboard.overdue": "Überfällige Rechnungen",
    "dashboard.recentInvoices": "Neueste Rechnungen",
    "dashboard.quickActions": "Schnellaktionen",
    "dashboard.createInvoice": "Neue Rechnung erstellen",
    "dashboard.revenueOverview": "Finanz- und Einnahmenübersicht",
    "dashboard.recentActivity": "Aktivitätsprotokoll",
    "dashboard.viewAllInvoices": "Alle Rechnungen anzeigen",
    "dashboard.addClient": "Neuen Kunden hinzufügen",
    "dashboard.addItem": "Katalogartikel hinzufügen",
    "dashboard.runAi": "KI-Generator starten",

    // Invoices Page
    "invoices.title": "Rechnungen",
    "invoices.subtitle": "Verwalten, erstellen, verfolgen und exportieren Sie Ihre Kundenrechnungen.",
    "invoices.invoiceNumber": "Rechnungs-Nr.",
    "invoices.client": "Kunde",
    "invoices.date": "Rechnungsdatum",
    "invoices.dueDate": "Fälligkeitsdatum",
    "invoices.amount": "Betrag",
    "invoices.status": "Status",
    "invoices.paid": "Bezahlt",
    "invoices.unpaid": "Unbezahlt",
    "invoices.draft": "Entwurf",
    "invoices.partiallyPaid": "Teilweise bezahlt",
    "invoices.overdue": "Überfällig",
    "invoices.allStatus": "Alle Rechnungen",
    "invoices.createInvoice": "Rechnung erstellen",
    "invoices.searchPlaceholder": "Rechnungen nach Nummer oder Kunden suchen...",
    "invoices.noInvoices": "Keine Rechnungen gefunden.",
    "invoices.exportPdf": "PDF herunterladen",

    // Clients Page
    "clients.title": "Kunden",
    "clients.subtitle": "Verwalten Sie Kundenprofile, Kontakte und Rechnungshistorie.",
    "clients.addClient": "Kunde hinzufügen",
    "clients.search": "Kunden nach Name, E-Mail oder Firma suchen...",
    "clients.name": "Kundenname",
    "clients.email": "E-Mail",
    "clients.phone": "Telefon",
    "clients.company": "Firma",
    "clients.totalBilled": "Gesamt abgerechnet",
    "clients.noClients": "Noch keine Kunden registriert.",

    // Catalog Page
    "products.title": "Katalog & Dienstleistungen",
    "products.subtitle": "Verwalten Sie Produkte, Dienstleistungen und Standardpreise.",
    "products.addProduct": "Artikel hinzufügen",
    "products.search": "Katalogartikel suchen...",
    "products.itemName": "Artikelname",
    "products.price": "Einzelpreis",
    "products.description": "Beschreibung",
    "products.noProducts": "Noch keine Katalogartikel hinzugefügt.",

    // Reports Page
    "reports.title": "Finanzberichte & Analysen",
    "reports.subtitle": "Detaillierte Übersicht über Einnahmen, Zahlungen und Steuern.",
    "reports.export": "Daten exportieren",
    "reports.totalRevenue": "Gesamteinnahmen",
    "reports.taxCollected": "Geschätzte Steuern",
    "reports.avgInvoice": "Durchschnittlicher Rechnungsbetrag",
    "reports.monthlyTrend": "Monatlicher Einnahmentrend",

    // Trash Page
    "trash.title": "Papierkorb",
    "trash.subtitle": "Stellen Sie gelöschte Rechnungen wieder her oder löschen Sie sie endgültig.",
    "trash.emptyTrash": "Papierkorb leeren",
    "trash.restore": "Wiederherstellen",
    "trash.noItems": "Papierkorb ist leer.",

    // Common UI Text
    "common.update": "Aktualisieren",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.actions": "Aktionen",
    "common.verified": "Verifiziert",
    "common.unverified": "Nicht verifiziert",
    "common.loading": "Wird geladen...",
    "common.language": "Sprache",
    "common.selectLanguage": "Sprache wählen",
  },
  fr: {
    // Nav & Sidebar
    "nav.dashboard": "Tableau de bord",
    "nav.invoices": "Factures",
    "nav.clients": "Clients",
    "nav.products": "Catalogue",
    "nav.reports": "Rapports",
    "nav.trash": "Corbeille",
    "nav.settings": "Paramètres",
    "nav.support": "Support",
    "nav.createNew": "Créer un nouveau",
    "nav.logout": "Déconnexion",
    "nav.overview": "Aperçu",
    "nav.templates": "Modèles",
    "nav.pricing": "Tarifs",
    "nav.faq": "FAQ",
    "nav.profileSettings": "Mon profil & Paramètres",
    "nav.helpSupport": "Aide & Support",
    "nav.aiWorkspace": "Espace IA",

    // Settings Page
    "settings.title": "Paramètres",
    "settings.subtitle": "Gérez votre profil, vos informations, votre fuseau horaire, votre langue et vos paramètres.",
    "settings.general": "Paramètres généraux du profil",
    "settings.timeZone": "Fuseau horaire",
    "settings.language": "Langue",
    "settings.saveChanges": "Enregistrer les modifications",
    "settings.accountEmail": "E-mail du compte",
    "settings.phoneNumber": "Numéro de téléphone",
    "settings.displayName": "Nom d'affichage",
    "settings.fullName": "Nom complet",
    "settings.businessProfile": "Profil d'entreprise",
    "settings.invoiceDefaults": "Factures par défaut",
    "settings.tabGeneral": "Général & Profil",
    "settings.tabCompany": "Entreprise & Branding",
    "settings.tabPayments": "Banque & Paiements",
    "settings.tabAi": "Assistant IA & Automation",
    "settings.tabTaxes": "Taxes & Conformité",
    "settings.tabSecurity": "Sécurité & Mots de passe",
    "settings.tabAppearance": "Apparence & Thèmes",
    "settings.tabNotifications": "Notifications",
    "settings.tabSessions": "Sessions actives",
    "settings.tabApiKeys": "Clés API & Développeur",
    "settings.tabData": "Exportation & Zone de danger",

    // Dashboard Page
    "dashboard.welcome": "Bon retour",
    "dashboard.totalBilled": "Revenu total",
    "dashboard.collected": "Factures payées",
    "dashboard.outstanding": "Solde en attente",
    "dashboard.overdue": "Factures en retard",
    "dashboard.recentInvoices": "Factures récentes",
    "dashboard.quickActions": "Actions rapides",
    "dashboard.createInvoice": "Créer une nouvelle facture",
    "dashboard.revenueOverview": "Performance financière des revenus",
    "dashboard.recentActivity": "Journal des activités récentes",
    "dashboard.viewAllInvoices": "Voir toutes les factures",
    "dashboard.addClient": "Ajouter un client",
    "dashboard.addItem": "Ajouter un article",
    "dashboard.runAi": "Lancer le génératuer IA",

    // Invoices Page
    "invoices.title": "Factures",
    "invoices.subtitle": "Gérez, créez, suivez et exportez vos factures clients.",
    "invoices.invoiceNumber": "Facture N°",
    "invoices.client": "Client",
    "invoices.date": "Date de facture",
    "invoices.dueDate": "Date d'échéance",
    "invoices.amount": "Montant",
    "invoices.status": "Statut",
    "invoices.paid": "Payé",
    "invoices.unpaid": "Non payé",
    "invoices.draft": "Brouillon",
    "invoices.partiallyPaid": "Partiellement payé",
    "invoices.overdue": "En retard",
    "invoices.allStatus": "Toutes les factures",
    "invoices.createInvoice": "Créer une facture",
    "invoices.searchPlaceholder": "Rechercher des factures par numéro ou client...",
    "invoices.noInvoices": "Aucune facture trouvée.",
    "invoices.exportPdf": "Télécharger le PDF",

    // Clients Page
    "clients.title": "Clients",
    "clients.subtitle": "Gérez vos fiches clients, contacts et historique de facturation.",
    "clients.addClient": "Ajouter un client",
    "clients.search": "Rechercher un client par nom, e-mail ou entreprise...",
    "clients.name": "Nom du client",
    "clients.email": "E-mail",
    "clients.phone": "Téléphone",
    "clients.company": "Entreprise",
    "clients.totalBilled": "Total facturé",
    "clients.noClients": "Aucun client enregistré.",

    // Catalog Page
    "products.title": "Catalogue & Services",
    "products.subtitle": "Gérez vos produits, prestations et grilles tarifaires.",
    "products.addProduct": "Ajouter un article",
    "products.search": "Rechercher dans le catalogue...",
    "products.itemName": "Nom de l'article",
    "products.price": "Prix unitaire",
    "products.description": "Description",
    "products.noProducts": "Aucun article dans le catalogue.",

    // Reports Page
    "reports.title": "Rapports financiers & Analyses",
    "reports.subtitle": "Aperçu détaillé de vos revenus, paiements et taxes.",
    "reports.export": "Exporter les données",
    "reports.totalRevenue": "Revenu total",
    "reports.taxCollected": "Taxes estimées collectées",
    "reports.avgInvoice": "Valeur moyenne d'une facture",
    "reports.monthlyTrend": "Tendance mensuelle des revenus",

    // Trash Page
    "trash.title": "Corbeille",
    "trash.subtitle": "Restaurez ou supprimez définitivement vos factures.",
    "trash.emptyTrash": "Vider la corbeille",
    "trash.restore": "Restaurer",
    "trash.noItems": "La corbeille est vide.",

    // Common UI Text
    "common.update": "Mettre à jour",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.actions": "Actions",
    "common.verified": "Vérifié",
    "common.unverified": "Non vérifié",
    "common.loading": "Chargement...",
    "common.language": "Langue",
    "common.selectLanguage": "Choisir la langue",
  },
  es: {
    // Nav & Sidebar
    "nav.dashboard": "Panel de control",
    "nav.invoices": "Facturas",
    "nav.clients": "Clientes",
    "nav.products": "Catálogo",
    "nav.reports": "Informes",
    "nav.trash": "Papelera",
    "nav.settings": "Configuración",
    "nav.support": "Soporte",
    "nav.createNew": "Crear nuevo",
    "nav.logout": "Cerrar sesión",
    "nav.overview": "Visión general",
    "nav.templates": "Plantillas",
    "nav.pricing": "Precios",
    "nav.faq": "Preguntas frecuentes",
    "nav.profileSettings": "Mi perfil y configuración",
    "nav.helpSupport": "Ayuda y soporte",
    "nav.aiWorkspace": "Espacio IA",

    // Settings Page
    "settings.title": "Configuración",
    "settings.subtitle": "Administre su perfil, detalles comerciales, zona horaria, idioma y configuración por defecto.",
    "settings.general": "Configuración general del perfil",
    "settings.timeZone": "Zona horaria",
    "settings.language": "Idioma",
    "settings.saveChanges": "Guardar cambios",
    "settings.accountEmail": "Correo electrónico",
    "settings.phoneNumber": "Número de teléfono",
    "settings.displayName": "Nombre visible",
    "settings.fullName": "Nombre completo",
    "settings.businessProfile": "Perfil de empresa",
    "settings.invoiceDefaults": "Valores predeterminados de factura",
    "settings.tabGeneral": "General y perfil",
    "settings.tabCompany": "Empresa y marca",
    "settings.tabPayments": "Banco y pagos",
    "settings.tabAi": "Asistente IA y automatización",
    "settings.tabTaxes": "Impuestos y cumplimiento",
    "settings.tabSecurity": "Seguridad y contraseñas",
    "settings.tabAppearance": "Apariencia y temas",
    "settings.tabNotifications": "Notificaciones",
    "settings.tabSessions": "Sesiones activas",
    "settings.tabApiKeys": "Claves API y desarrolladores",
    "settings.tabData": "Exportación y zona de peligro",

    // Dashboard Page
    "dashboard.welcome": "Bienvenido de nuevo",
    "dashboard.totalBilled": "Ingresos totales",
    "dashboard.collected": "Facturas pagadas",
    "dashboard.outstanding": "Saldo pendiente",
    "dashboard.overdue": "Facturas vencidas",
    "dashboard.recentInvoices": "Facturas recientes",
    "dashboard.quickActions": "Acciones rápidas",
    "dashboard.createInvoice": "Crear nueva factura",
    "dashboard.revenueOverview": "Rendimiento de ingresos financieros",
    "dashboard.recentActivity": "Registro de actividades recientes",
    "dashboard.viewAllInvoices": "Ver todas las facturas",
    "dashboard.addClient": "Añadir nuevo cliente",
    "dashboard.addItem": "Añadir artículo al catálogo",
    "dashboard.runAi": "Iniciar generador IA",

    // Invoices Page
    "invoices.title": "Facturas",
    "invoices.subtitle": "Gestione, genere, rastree y exporte sus facturas de clientes.",
    "invoices.invoiceNumber": "Factura N.º",
    "invoices.client": "Cliente",
    "invoices.date": "Fecha de factura",
    "invoices.dueDate": "Fecha de vencimiento",
    "invoices.amount": "Monto",
    "invoices.status": "Estado",
    "invoices.paid": "Pagado",
    "invoices.unpaid": "No pagado",
    "invoices.draft": "Borrador",
    "invoices.partiallyPaid": "Parcialmente pagado",
    "invoices.overdue": "Vencido",
    "invoices.allStatus": "Todas las facturas",
    "invoices.createInvoice": "Crear factura",
    "invoices.searchPlaceholder": "Buscar facturas por número o cliente...",
    "invoices.noInvoices": "No se encontraron facturas.",
    "invoices.exportPdf": "Descargar PDF",

    // Clients Page
    "clients.title": "Clientes",
    "clients.subtitle": "Gestione perfiles de clientes, contactos e historial de facturación.",
    "clients.addClient": "Añadir cliente",
    "clients.search": "Buscar clientes por nombre, correo o empresa...",
    "clients.name": "Nombre del cliente",
    "clients.email": "Correo electrónico",
    "clients.phone": "Teléfono",
    "clients.company": "Empresa",
    "clients.totalBilled": "Total facturado",
    "clients.noClients": "No hay clientes registrados aún.",

    // Catalog Page
    "products.title": "Catálogo y servicios",
    "products.subtitle": "Mantenga productos, servicios y precios predeterminados.",
    "products.addProduct": "Añadir artículo",
    "products.search": "Buscar en el catálogo...",
    "products.itemName": "Nombre del artículo",
    "products.price": "Precio unitario",
    "products.description": "Descripción",
    "products.noProducts": "No hay artículos en el catálogo.",

    // Reports Page
    "reports.title": "Informes financieros y análisis",
    "reports.subtitle": "Desglose completo de ingresos, pagos e impuestos.",
    "reports.export": "Exportar datos",
    "reports.totalRevenue": "Ingresos totales",
    "reports.taxCollected": "Impuestos estimados cobrados",
    "reports.avgInvoice": "Valor medio de factura",
    "reports.monthlyTrend": "Tendencia mensual de ingresos",

    // Trash Page
    "trash.title": "Papelera",
    "trash.subtitle": "Recupere facturas eliminadas o bórrelas permanentemente.",
    "trash.emptyTrash": "Vaciar papelera",
    "trash.restore": "Restaurar",
    "trash.noItems": "La papelera está vacía.",

    // Common UI Text
    "common.update": "Actualizar",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.actions": "Acciones",
    "common.verified": "Verificado",
    "common.unverified": "Sin verificar",
    "common.loading": "Cargando...",
    "common.language": "Idioma",
    "common.selectLanguage": "Seleccionar idioma",
  },
};

interface I18nContextType {
  timeZone: string;
  setTimeZone: (tz: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  formatDate: (value?: string | Date | number | null, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (value?: string | Date | number | null, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  
  const [timeZone, setTimeZoneState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoisen_timezone");
      if (stored) return stored;
    }
    return user?.timeZone || "Asia/Kolkata";
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoisen_language") as LanguageCode;
      if (stored && translations[stored]) return stored;
    }
    return (user?.language as LanguageCode) || "en";
  });

  // Keep in sync with user profile if profile changes
  useEffect(() => {
    if (user?.timeZone && user.timeZone !== timeZone) {
      setTimeZoneState(user.timeZone);
      if (typeof window !== "undefined") {
        localStorage.setItem("invoisen_timezone", user.timeZone);
      }
    }

    if (user?.language && translations[user.language as LanguageCode] && user.language !== language) {
      setLanguageState(user.language as LanguageCode);
      if (typeof window !== "undefined") {
        localStorage.setItem("invoisen_language", user.language);
      }
    }
  }, [user?.timeZone, user?.language]);

  const setTimeZone = (newTz: string) => {
    setTimeZoneState(newTz);
    if (typeof window !== "undefined") {
      localStorage.setItem("invoisen_timezone", newTz);
    }
    if (user) {
      updateProfile({ timeZone: newTz }).catch(() => null);
    }
  };

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("invoisen_language", newLang);
    }
    if (user) {
      updateProfile({ language: newLang }).catch(() => null);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language] || translations["en"];
    return langDict[key] || translations["en"][key] || defaultText || key;
  };

  const formatDate = (value?: string | Date | number | null, options?: Intl.DateTimeFormatOptions): string => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "—";

      const localeMap: Record<LanguageCode, string> = {
        en: "en-US",
        de: "de-DE",
        fr: "fr-FR",
        es: "es-ES",
      };
      const locale = localeMap[language] || "en-US";

      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: timeZone || "Asia/Kolkata",
        ...options,
      }).format(d);
    } catch {
      return new Date(value).toLocaleDateString();
    }
  };

  const formatDateTime = (value?: string | Date | number | null, options?: Intl.DateTimeFormatOptions): string => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "—";

      const localeMap: Record<LanguageCode, string> = {
        en: "en-US",
        de: "de-DE",
        fr: "fr-FR",
        es: "es-ES",
      };
      const locale = localeMap[language] || "en-US";

      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timeZone || "Asia/Kolkata",
        ...options,
      }).format(d);
    } catch {
      return new Date(value).toLocaleString();
    }
  };

  return (
    <I18nContext.Provider
      value={{
        timeZone,
        setTimeZone,
        language,
        setLanguage,
        t,
        formatDate,
        formatDateTime,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if accessed outside Provider
    return {
      timeZone: "Asia/Kolkata",
      setTimeZone: () => {},
      language: "en" as LanguageCode,
      setLanguage: () => {},
      t: (key: string, defaultText?: string) => defaultText || key,
      formatDate: (val?: string | Date | number | null) => (val ? new Date(val).toLocaleDateString() : "—"),
      formatDateTime: (val?: string | Date | number | null) => (val ? new Date(val).toLocaleString() : "—"),
    };
  }
  return context;
}

