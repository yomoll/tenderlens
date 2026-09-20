export type TenderSource = "contracts-finder" | "find-a-tender";

export type TenderStatus = "planning" | "open" | "awarded" | "closed" | "unknown";

export type TenderValue = {
  min?: number;
  max?: number;
  currency?: string;
};

export type CpvCode = {
  code: string;
  description?: string;
};

export type TenderBuyer = {
  name: string;
  identifier?: string;
};

export type TenderDocument = {
  title: string;
  url?: string;
  type?: string;
};

export type Tender = {
  id: string;
  source: TenderSource;
  sourceUrl: string;
  sourceLabel: string;

  title: string;
  description?: string;

  buyer: TenderBuyer;

  status: TenderStatus;

  publishedAt?: string;
  updatedAt?: string;
  deadline?: string;
  clarificationDeadline?: string;
  contractStart?: string;
  contractEnd?: string;

  value?: TenderValue;

  locations?: string[];

  cpvCodes?: CpvCode[];
  category?: string;

  suitableForSME?: boolean;
  suitableForVCSE?: boolean;

  procurementStage?: string;
  procedureType?: string;
  noticeType?: string;

  ocid?: string;
  reference?: string;
  noticeId?: string;

  lots?: string[];
  documents?: TenderDocument[];
  additionalText?: string[];
  selectionCriteria?: string[];

  relevanceScore?: number;
  isFixture?: boolean;
};

export type SearchStatusFilter = "open" | "planning" | "awarded";

export type SearchRegion = "uk" | "england" | "scotland" | "wales" | "northern-ireland";

export type SearchCategory =
  | "technology"
  | "healthcare"
  | "social-care"
  | "construction"
  | "professional-services"
  | "marketing"
  | "education"
  | "transport"
  | "facilities"
  | "environment"
  | "other";

export type SearchDeadlinePreset = "7" | "30" | "90" | "custom";

export type SearchSort =
  | "best-match"
  | "deadline-soonest"
  | "newly-published"
  | "highest-value"
  | "lowest-value";

export type SearchParams = {
  q?: string;
  status?: SearchStatusFilter;
  region?: SearchRegion;
  minValue?: number;
  maxValue?: number;
  sme?: boolean;
  vcse?: boolean;
  category?: SearchCategory;
  deadlinePreset?: SearchDeadlinePreset;
  deadlineFrom?: string;
  deadlineTo?: string;
  buyer?: string;
  sort?: SearchSort;
  cursor?: string;
  pageSize?: number;
};

export type SourceHealth = {
  ok: boolean;
  label: string;
  message?: string;
  statusCode?: number;
};

export type TenderSearchResult = {
  results: Tender[];
  total?: number;
  nextCursor?: string;
  sourceStatus: {
    contractsFinder: SourceHealth;
    findATender: SourceHealth;
    usingFixtures: boolean;
  };
};

export interface ProcurementSource {
  id: TenderSource;
  search(params: SearchParams): Promise<TenderSearchResult>;
  getTender(id: string): Promise<Tender | null>;
}

export const MISSING_NOTICE_TEXT = "Not specified in the published notice.";

export const UPSTREAM_UNAVAILABLE_MESSAGE =
  "Tender data is temporarily unavailable. Please try again shortly or search directly on Find a Tender.";
