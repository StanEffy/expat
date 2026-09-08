import type {
  MunicipalityId,
  MunicipalContactInfo,
  OnboardingAnswers,
  OnboardingTask,
} from '@/types/onboarding';

export const MUNICIPAL_HUBS: Record<MunicipalityId, MunicipalContactInfo> = {
  helsinki: {
    id: 'helsinki',
    name: 'Helsinki',
    hubName: 'International House Helsinki (IHH)',
    address: 'Lintulahdenkuja 2 D, 2nd floor, 00530 Helsinki',
    website: 'https://ihhelsinki.fi',
    email: 'info@ihhelsinki.fi',
    serviceBookingUrl: 'https://ihhelsinki.fi/book-an-appointment/',
    descriptionKey: 'onboarding.hubs.helsinki_desc',
  },
  espoo: {
    id: 'espoo',
    name: 'Espoo',
    hubName: 'Hello Espoo Hub (Iso Omena)',
    address: 'Service Centre, Iso Omena (Suomenlahdentie 1), 02230 Espoo',
    website: 'https://www.espoo.fi/en/services/hello-espoo-hub',
    email: 'hello.espoo@espoo.fi',
    serviceBookingUrl: 'https://www.espoo.fi/en/services/hello-espoo-hub',
    descriptionKey: 'onboarding.hubs.espoo_desc',
  },
  vantaa: {
    id: 'vantaa',
    name: 'Vantaa',
    hubName: 'International Vantaa Info (Dixie)',
    address: 'Dixie Shopping Centre, 2nd floor (Ratatie 11), 01300 Vantaa',
    website: 'https://www.vantaa.fi/en/international-vantaa',
    email: 'international@vantaa.fi',
    serviceBookingUrl: 'https://www.vantaa.fi/en/international-vantaa',
    descriptionKey: 'onboarding.hubs.vantaa_desc',
  },
  tampere: {
    id: 'tampere',
    name: 'Tampere',
    hubName: 'International House Tampere',
    address: 'Rautatienkatu 10, 33100 Tampere',
    website: 'https://internationalhousetampere.fi',
    email: 'international@tampere.fi',
    serviceBookingUrl: 'https://internationalhousetampere.fi/services/',
    descriptionKey: 'onboarding.hubs.tampere_desc',
  },
  turku: {
    id: 'turku',
    name: 'Turku',
    hubName: 'International House Turku',
    address: 'Linnankatu 31, 20100 Turku',
    website: 'https://www.turku.fi/en/international-house-turku',
    email: 'internationalhouse@turku.fi',
    serviceBookingUrl: 'https://www.turku.fi/en/international-house-turku',
    descriptionKey: 'onboarding.hubs.turku_desc',
  },
  oulu: {
    id: 'oulu',
    name: 'Oulu',
    hubName: 'International House Oulu',
    address: 'Uusikatu 52, 90100 Oulu',
    website: 'https://www.ouka.fi/en/international-house-oulu',
    email: 'ihoulu@ouka.fi',
    serviceBookingUrl: 'https://www.ouka.fi/en/international-house-oulu',
    descriptionKey: 'onboarding.hubs.oulu_desc',
  },
  other: {
    id: 'other',
    name: 'Other Municipality / Muu kunta',
    hubName: 'InfoFinland & Local Municipal Services',
    website: 'https://www.infofinland.fi',
    descriptionKey: 'onboarding.hubs.other_desc',
  },
};

export const ONBOARDING_TASKS: OnboardingTask[] = [
  // --- BEFORE ARRIVAL ---
  {
    id: 'residence_permit_migri',
    category: 'legal',
    phase: 'before_arrival',
    priority: 'critical',
    titleKey: 'onboarding.tasks.residence_permit_migri.title',
    descriptionKey: 'onboarding.tasks.residence_permit_migri.description',
    estimatedDays: '30-90 days',
    requiredDocuments: ['passport', 'employment_contract_or_study_cert', 'financial_means', 'health_insurance'],
    applicableCitizenships: ['non_eu'],
    officialLinks: [
      { title: 'Migri (Enter Finland)', url: 'https://enterfinland.fi/eServices', isOfficial: true },
      { title: 'Finnish Immigration Service', url: 'https://migri.fi/en/home', isOfficial: true },
    ],
  },
  {
    id: 'apostille_documents',
    category: 'legal',
    phase: 'before_arrival',
    priority: 'high',
    titleKey: 'onboarding.tasks.apostille_documents.title',
    descriptionKey: 'onboarding.tasks.apostille_documents.description',
    estimatedDays: '14-30 days',
    requiredDocuments: ['marriage_certificate_apostille', 'birth_certificates_apostille', 'legalized_translations'],
    officialLinks: [
      { title: 'DVV: Legalisation of foreign documents', url: 'https://dvv.fi/en/legalisation-of-foreign-documents', isOfficial: true },
    ],
  },
  {
    id: 'temporary_housing',
    category: 'housing',
    phase: 'before_arrival',
    priority: 'high',
    titleKey: 'onboarding.tasks.temporary_housing.title',
    descriptionKey: 'onboarding.tasks.temporary_housing.description',
    estimatedDays: '7-14 days',
    requiredDocuments: ['identification', 'proof_of_income'],
    officialLinks: [
      { title: 'Oikotie Vuokra-asunnot', url: 'https://asunnot.oikotie.fi/vuokra-asunnot', isOfficial: false },
      { title: 'Vuokraovi', url: 'https://www.vuokraovi.com/', isOfficial: false },
      { title: 'SATO / Lumo Rentals', url: 'https://lumo.fi/en', isOfficial: false },
    ],
  },

  // --- FIRST DAYS ---
  {
    id: 'migri_eu_registration',
    category: 'legal',
    phase: 'first_days',
    priority: 'critical',
    titleKey: 'onboarding.tasks.migri_eu_registration.title',
    descriptionKey: 'onboarding.tasks.migri_eu_registration.description',
    estimatedDays: 'Within 90 days of arrival',
    requiredDocuments: ['eu_passport_or_id', 'employment_contract', 'study_certificate_if_student'],
    applicableCitizenships: ['eu_eea'],
    officialLinks: [
      { title: 'Migri: EU Right of Residence', url: 'https://migri.fi/en/eu-citizen', isOfficial: true },
      { title: 'Enter Finland for EU Citizens', url: 'https://enterfinland.fi', isOfficial: true },
    ],
  },
  {
    id: 'dvv_registration',
    category: 'legal',
    phase: 'first_days',
    priority: 'critical',
    titleKey: 'onboarding.tasks.dvv_registration.title',
    descriptionKey: 'onboarding.tasks.dvv_registration.description',
    estimatedDays: '1-3 weeks',
    requiredDocuments: ['passport', 'residence_permit_card_or_eu_cert', 'rental_lease_contract', 'marriage_birth_certificates'],
    officialLinks: [
      { title: 'DVV: Foreigner Registration Form', url: 'https://dvv.fi/en/foreigner-registration', isOfficial: true },
      { title: 'Book an appointment at DVV / IHH', url: 'https://ajanvaraus.dvv.fi/', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'Book through International House Helsinki (IHH) at Lintulahdenkuja 2 D for one-stop DVV service.',
      espoo: 'Visit Hello Espoo Hub at Iso Omena or IHH in Helsinki.',
      vantaa: 'Visit International Vantaa Info in Dixie or IHH in Helsinki.',
      tampere: 'Visit International House Tampere on Rautatienkatu 10 for streamlined DVV guidance.',
      turku: 'Visit International House Turku on Linnankatu 31.',
      oulu: 'Visit International House Oulu on Uusikatu 52.',
    },
  },
  {
    id: 'vero_tax_card',
    category: 'tax_finance',
    phase: 'first_days',
    priority: 'critical',
    titleKey: 'onboarding.tasks.vero_tax_card.title',
    descriptionKey: 'onboarding.tasks.vero_tax_card.description',
    estimatedDays: '3-7 days',
    requiredDocuments: ['employment_contract', 'estimated_yearly_income', 'finnish_id_code_or_passport'],
    applicableReasons: ['employed', 'specialist', 'entrepreneur', 'jobseeker'],
    officialLinks: [
      { title: 'Vero (Tax Administration): Moving to Finland', url: 'https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/moving_to_finland/', isOfficial: true },
      { title: 'MyTax (OmaVero)', url: 'https://www.vero.fi/en/e-services/mytax/', isOfficial: true },
    ],
  },
  {
    id: 'local_sim_card',
    category: 'daily_life',
    phase: 'first_days',
    priority: 'medium',
    titleKey: 'onboarding.tasks.local_sim_card.title',
    descriptionKey: 'onboarding.tasks.local_sim_card.description',
    estimatedDays: '1 day',
    requiredDocuments: ['passport_for_postpaid'],
    officialLinks: [
      { title: 'DNA, Elisa, Telia Prepaid from R-Kioski', url: 'https://www.r-kioski.fi/', isOfficial: false },
    ],
  },
  {
    id: 'public_transport_app',
    category: 'daily_life',
    phase: 'first_days',
    priority: 'high',
    titleKey: 'onboarding.tasks.public_transport_app.title',
    descriptionKey: 'onboarding.tasks.public_transport_app.description',
    estimatedDays: '1 day',
    officialLinks: [
      { title: 'HSL (Helsinki, Espoo, Vantaa)', url: 'https://www.hsl.fi/en', isOfficial: true },
      { title: 'Nysse (Tampere region)', url: 'https://www.nysse.fi/en/', isOfficial: true },
      { title: 'Föli (Turku region)', url: 'https://www.foli.fi/en', isOfficial: true },
      { title: 'Oulun joukkoliikenne', url: 'https://www.oulunjoukkoliikenne.fi/en', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'Download HSL app. Once your DVV permanent address (kotikunta) is confirmed, you qualify for discounted resident season tickets.',
      espoo: 'HSL app covers Helsinki, Espoo, and Vantaa (AB/ABC/ABCD zones).',
      vantaa: 'HSL app covers Helsinki, Espoo, and Vantaa.',
      tampere: 'Download Nysse Mobile app for Tampere regional buses and trams.',
      turku: 'Download Föli app for Turku public transit.',
      oulu: 'Use Waltti card or mobile app for Oulu public transit.',
    },
  },

  // --- FIRST MONTH ---
  {
    id: 'bank_account_strong_id',
    category: 'tax_finance',
    phase: 'first_month',
    priority: 'critical',
    titleKey: 'onboarding.tasks.bank_account_strong_id.title',
    descriptionKey: 'onboarding.tasks.bank_account_strong_id.description',
    estimatedDays: '1-4 weeks',
    requiredDocuments: ['passport', 'finnish_personal_identity_code', 'residence_permit_card_or_eu_cert', 'employment_contract', 'proof_of_address'],
    officialLinks: [
      { title: 'Suomi.fi e-Identification', url: 'https://www.suomi.fi/instructions-and-support/identification', isOfficial: true },
      { title: 'Nordea, OP, Danske Bank, S-Pankki', url: 'https://www.fine.fi/en/financial-matters/banking/opening-a-basic-payment-account.html', isOfficial: false },
    ],
  },
  {
    id: 'kela_social_security',
    category: 'healthcare',
    phase: 'first_month',
    priority: 'critical',
    titleKey: 'onboarding.tasks.kela_social_security.title',
    descriptionKey: 'onboarding.tasks.kela_social_security.description',
    estimatedDays: '3-6 weeks',
    requiredDocuments: ['employment_contract', 'residence_permit_or_eu_cert', 'dvv_kotikunta_decision', 'marriage_child_certificates'],
    officialLinks: [
      { title: 'Kela: From other countries to Finland', url: 'https://www.kela.fi/moving-to-finland', isOfficial: true },
      { title: 'OmaKela e-Service', url: 'https://www.kela.fi/omakela', isOfficial: true },
    ],
  },
  {
    id: 'home_insurance_contract',
    category: 'housing',
    phase: 'first_month',
    priority: 'high',
    titleKey: 'onboarding.tasks.home_insurance_contract.title',
    descriptionKey: 'onboarding.tasks.home_insurance_contract.description',
    estimatedDays: '1-2 days',
    requiredDocuments: ['rental_contract_address'],
    officialLinks: [
      { title: 'Fine: Insurance info for consumers', url: 'https://www.fine.fi/en/insurance/home-insurance.html', isOfficial: false },
    ],
  },
  {
    id: 'electricity_contract',
    category: 'housing',
    phase: 'first_month',
    priority: 'high',
    titleKey: 'onboarding.tasks.electricity_contract.title',
    descriptionKey: 'onboarding.tasks.electricity_contract.description',
    estimatedDays: '1-3 days',
    officialLinks: [
      { title: 'Sahkonkilpailutus (Electricity comparison)', url: 'https://sahkonkilpailutus.fi/', isOfficial: false },
      { title: 'Energiavirasto price comparison', url: 'https://www.sahkonhinta.fi/', isOfficial: true },
    ],
  },
  {
    id: 'healthcare_center_registration',
    category: 'healthcare',
    phase: 'first_month',
    priority: 'high',
    titleKey: 'onboarding.tasks.healthcare_center_registration.title',
    descriptionKey: 'onboarding.tasks.healthcare_center_registration.description',
    estimatedDays: '1-2 days',
    officialLinks: [
      { title: 'Omaolo health symptom checker', url: 'https://www.omaolo.fi/en', isOfficial: true },
      { title: 'Medical Helpline 116 117', url: 'https://116117.fi/en/', isOfficial: true },
      { title: 'Maisa (Helsinki, Espoo, Vantaa health portal)', url: 'https://www.maisa.fi/', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'In the capital region, use the Maisa portal (maisa.fi) to contact your local health station (terveysasema). Call 116 117 before visiting emergency clinics.',
      espoo: 'Use Maisa portal for Western Uusimaa Wellbeing Services County (Länsi-Uudenmaan hyvinvointialue).',
      vantaa: 'Use Maisa portal for Vantaa and Kerava Wellbeing Services County.',
      tampere: 'Services organized by Pirkanmaa Wellbeing Services County (Pirha). Use OmaPirha portal.',
      turku: 'Services organized by Southwest Finland Wellbeing Services County (Varha).',
      oulu: 'Services organized by North Ostrobothnia Wellbeing Services County (Pohde).',
    },
  },
  {
    id: 'daycare_application',
    category: 'family_education',
    phase: 'first_month',
    priority: 'critical',
    titleKey: 'onboarding.tasks.daycare_application.title',
    descriptionKey: 'onboarding.tasks.daycare_application.description',
    estimatedDays: 'Apply 4 months before needed',
    requiredDocuments: ['child_id_code', 'income_statements_for_fee', 'dvv_kotikunta'],
    applicableFamily: ['children_preschool'],
    officialLinks: [
      { title: 'Municipal Early Childhood Education (Varhaiskasvatus)', url: 'https://www.infofinland.fi/en/family/early-childhood-education', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'Apply via Astuti / eVaka Helsinki online service at least 4 months in advance.',
      espoo: 'Apply via eVaka Espoo online service.',
      vantaa: 'Apply via eVaka Vantaa service.',
      tampere: 'Apply via eVaka Tampere service.',
      turku: 'Apply via Turku municipal e-services portal (Varhaiskasvatus).',
      oulu: 'Apply via eVaka Oulu portal.',
    },
  },
  {
    id: 'school_registration',
    category: 'family_education',
    phase: 'first_month',
    priority: 'critical',
    titleKey: 'onboarding.tasks.school_registration.title',
    descriptionKey: 'onboarding.tasks.school_registration.description',
    estimatedDays: '1-3 weeks',
    requiredDocuments: ['school_reports_from_previous_country', 'child_passport', 'address_confirmation'],
    applicableFamily: ['children_school'],
    officialLinks: [
      { title: 'InfoFinland: Comprehensive education in Finland', url: 'https://www.infofinland.fi/en/education/comprehensive-education', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'Children without Finnish/Swedish language attend preparatory education (valmistava opetus) for one year. Contact Helsinki Education Division.',
      espoo: 'Contact Espoo Finnish Education Unit for preparatory class placement.',
      vantaa: 'Contact Vantaa Education Services for preparatory class placement.',
      tampere: 'Register with Tampere Basic Education preparatory teaching.',
      turku: 'Register with Turku International School or preparatory education.',
      oulu: 'Register with Oulu Basic Education division.',
    },
  },

  // --- SETTLED & INTEGRATION ---
  {
    id: 'integration_plan_te',
    category: 'integration_language',
    phase: 'settled',
    priority: 'medium',
    titleKey: 'onboarding.tasks.integration_plan_te.title',
    descriptionKey: 'onboarding.tasks.integration_plan_te.description',
    estimatedDays: '2-4 weeks',
    requiredDocuments: ['residence_permit_or_eu_registration', 'dvv_kotikunta', 'curriculum_vitae'],
    officialLinks: [
      { title: 'Työmarkkinatori / TE-Services', url: 'https://tyomarkkinatori.fi/en', isOfficial: true },
      { title: 'Municipal Employment Services (Kuntakokeilu)', url: 'https://kotoutuminen.fi/en/integration-services', isOfficial: true },
    ],
  },
  {
    id: 'finnish_language_course',
    category: 'integration_language',
    phase: 'settled',
    priority: 'high',
    titleKey: 'onboarding.tasks.finnish_language_course.title',
    descriptionKey: 'onboarding.tasks.finnish_language_course.description',
    estimatedDays: 'Ongoing',
    officialLinks: [
      { title: 'Finnishcourses.fi (Helsinki, Tampere, Turku, Oulu)', url: 'https://finnishcourses.fi/', isOfficial: true },
      { title: 'Kielibuusti (Language resources for specialists)', url: 'https://www.kielibuusti.fi/en', isOfficial: true },
      { title: 'Työväenopisto / Adult Education Centres (Ilmonet)', url: 'https://ilmonet.fi/', isOfficial: true },
    ],
  },
  {
    id: 'library_card',
    category: 'daily_life',
    phase: 'settled',
    priority: 'optional',
    titleKey: 'onboarding.tasks.library_card.title',
    descriptionKey: 'onboarding.tasks.library_card.description',
    estimatedDays: '1 day',
    requiredDocuments: ['passport_or_finnish_id', 'finnish_address'],
    officialLinks: [
      { title: 'Helmet Libraries (Helsinki, Espoo, Vantaa, Kauniainen)', url: 'https://www.helmet.fi/en-US', isOfficial: true },
      { title: 'PIKI Libraries (Tampere & Pirkanmaa)', url: 'https://piki.verkkokirjasto.fi/', isOfficial: true },
      { title: 'Vaski Libraries (Turku & Southwest Finland)', url: 'https://vaski.finna.fi/', isOfficial: true },
      { title: 'OUTI Libraries (Oulu region)', url: 'https://outi.finna.fi/', isOfficial: true },
    ],
    municipalNotes: {
      helsinki: 'Visit Oodi or any of the 60+ Helmet libraries. Borrow books, 3D printers, sewing machines, musical instruments, meeting rooms for free.',
      espoo: 'Helmet library card works across Helsinki, Espoo, Vantaa, and Kauniainen.',
      vantaa: 'Helmet library card works across the whole capital region.',
      tampere: 'Register for a PIKI library card at Metso Central Library or local branches.',
      turku: 'Register for a Vaski library card at Turku Main Library.',
      oulu: 'Register for an OUTI library card at Oulu Main Library.',
    },
  },
  {
    id: 'driver_license_exchange',
    category: 'daily_life',
    phase: 'settled',
    priority: 'medium',
    titleKey: 'onboarding.tasks.driver_license_exchange.title',
    descriptionKey: 'onboarding.tasks.driver_license_exchange.description',
    estimatedDays: 'Within 1-2 years of moving',
    requiredDocuments: ['foreign_driver_license', 'medical_certificate', 'pass_photos'],
    officialLinks: [
      { title: 'Ajovarma / Traficom: Exchanging a foreign driving licence', url: 'https://ajovarma.fi/en/driving-licence/exchanging-a-foreign-driving-licence', isOfficial: true },
    ],
  },
];

export function filterTasksForUser(answers: OnboardingAnswers): OnboardingTask[] {
  return ONBOARDING_TASKS.filter((task) => {
    if (
      task.applicableCitizenships &&
      !task.applicableCitizenships.includes(answers.citizenship)
    ) {
      return false;
    }

    if (
      task.applicableReasons &&
      !task.applicableReasons.includes(answers.reason)
    ) {
      return false;
    }

    if (task.applicableFamily) {
      const match = task.applicableFamily.includes(answers.family);
      if (!match) {
        // If task is for preschool children and user selected preschool, match
        // If task is for school and user selected school, match
        return false;
      }
    }

    if (
      task.applicableMunicipalities &&
      !task.applicableMunicipalities.includes(answers.municipality)
    ) {
      return false;
    }

    return true;
  });
}
