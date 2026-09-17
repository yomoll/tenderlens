import type { Intent, Interpretation } from "../types";

type TopicPack = {
  id: string;
  match: RegExp;
  interpretation: string;
  queries: string[];
  preferredPaths: string[];
};

const TOPIC_PACKS: TopicPack[] = [
  {
    id: "self-assessment",
    match:
      /self assessment|tax return|file (for |my |a )?tax|submit (my )?tax|hmrc tax|pay income tax|register for self assessment|i want to file/i,
    interpretation:
      "You want official guidance on Self Assessment, tax returns, or registering with HMRC to file tax.",
    queries: [
      "Self Assessment tax return",
      "register for Self Assessment",
      "file tax return UK",
      "log in file Self Assessment",
    ],
    preferredPaths: [
      "/self-assessment-tax-returns",
      "/log-in-file-self-assessment-tax-return",
      "/register-for-self-assessment",
      "/self-assessment-tax-return-deadlines",
    ],
  },
  {
    id: "self-employment",
    match:
      /self[- ]?employ|sole trader|working for yourself|freelance|own business|started trading|register for tax/i,
    interpretation:
      "You want to know which government registrations and tax rules usually apply when you start self-employment in the UK.",
    queries: [
      "set up as sole trader",
      "working for yourself",
      "register self assessment sole trader",
      "self employed National Insurance",
      "VAT registration threshold",
    ],
    preferredPaths: [
      "/set-up-as-sole-trader",
      "/working-for-yourself",
      "/become-sole-trader",
      "/self-assessment-tax-returns",
      "/vat-registration",
    ],
  },
  {
    id: "limited-company",
    match: /limited company|ltd company|register a company|companies house/i,
    interpretation: "You want official steps for setting up or registering a limited company in the UK.",
    queries: ["set up a limited company", "register company Companies House", "corporation tax registration"],
    preferredPaths: ["/limited-company-formation", "/set-up-business"],
  },
  {
    id: "universal-credit",
    match: /universal credit|\buc\b/i,
    interpretation: "You want official guidance about Universal Credit, including who can claim and how to apply.",
    queries: ["Universal Credit how to claim", "Universal Credit eligibility"],
    preferredPaths: ["/universal-credit"],
  },
  {
    id: "child-benefit",
    match: /child benefit/i,
    interpretation: "You want official guidance on Child Benefit, including claiming and eligibility.",
    queries: ["Child Benefit claim", "Child Benefit eligibility"],
    preferredPaths: ["/child-benefit"],
  },
  {
    id: "childcare",
    match: /childcare|tax-free childcare|free childcare|30 hours/i,
    interpretation: "You want official information about government childcare schemes and how to apply.",
    queries: ["Tax-Free Childcare", "15 hours free childcare", "30 hours free childcare"],
    preferredPaths: ["/tax-free-childcare", "/childcare-calculator"],
  },
  {
    id: "passport",
    match: /passport/i,
    interpretation: "You want official guidance about UK passports, including applying or renewing.",
    queries: ["apply renew passport", "passport fees"],
    preferredPaths: ["/apply-renew-passport"],
  },
  {
    id: "driving",
    match: /driving licence|dvla|vehicle tax|mot\b|theory test|v5c|log book|move house|moved house/i,
    interpretation: "You want official driving or vehicle guidance from DVLA or related GOV.UK pages.",
    queries: ["change address driving licence DVLA", "change address vehicle log book V5C", "tell DVLA moved house"],
    preferredPaths: ["/change-address-driving-licence", "/change-name-address-v5c"],
  },
  {
    id: "visa",
    match: /\bvisa\b|immigration|leave to remain|settled status|right to work/i,
    interpretation: "You want official UK immigration or visa guidance.",
    queries: ["UK visa check", "apply visa UK"],
    preferredPaths: ["/check-uk-visa"],
  },
  {
    id: "national-insurance",
    match: /national insurance|\bni number\b|nino/i,
    interpretation: "You want official guidance about National Insurance numbers or contributions.",
    queries: ["apply National Insurance number", "National Insurance contributions"],
    preferredPaths: ["/apply-national-insurance-number", "/national-insurance"],
  },
  {
    id: "pip",
    match: /personal independence payment|\bpip\b/i,
    interpretation: "You want official guidance about Personal Independence Payment.",
    queries: ["Personal Independence Payment claim", "PIP eligibility"],
    preferredPaths: ["/pip"],
  },
  {
    id: "council-tax",
    match: /council tax/i,
    interpretation: "You want official guidance about Council Tax, discounts, or exemptions.",
    queries: ["Council Tax", "Council Tax discount exemption"],
    preferredPaths: ["/council-tax"],
  },
  {
    id: "housing",
    match: /housing benefit|homeless|social housing|council housing/i,
    interpretation: "You want official guidance about housing support or applying for a council home.",
    queries: ["apply council housing", "homeless help", "Housing Benefit"],
    preferredPaths: ["/apply-for-council-housing", "/homelessness-help-from-council"],
  },
  {
    id: "student-finance",
    match: /student finance|student loan|tuition fee/i,
    interpretation: "You want official guidance about student finance in the UK.",
    queries: ["student finance apply", "student loan"],
    preferredPaths: ["/student-finance"],
  },
  {
    id: "pensions",
    match: /state pension|pension credit/i,
    interpretation: "You want official guidance about the State Pension or Pension Credit.",
    queries: ["State Pension", "Pension Credit"],
    preferredPaths: ["/state-pension", "/pension-credit"],
  },
  {
    id: "gp-health",
    match: /\bgp\b|nhs number|prescription|gp surgery/i,
    interpretation: "You want official guidance about NHS registration or related health services.",
    queries: ["register GP", "NHS number"],
    preferredPaths: ["/register-with-a-gp-practice"],
  },
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "have",
  "what",
  "when",
  "where",
  "which",
  "your",
  "you",
  "need",
  "just",
  "ive",
  "i've",
  "started",
  "things",
  "about",
  "into",
  "them",
  "they",
  "does",
  "do",
  "how",
  "can",
  "get",
  "want",
]);

function detectIntent(question: string): Intent {
  if (/register|sign up|set up/i.test(question)) return "register";
  if (/apply|claim|application/i.test(question)) return "apply";
  if (/eligible|qualify|can i get|do i get/i.test(question)) return "eligibility";
  if (/deadline|by when|when do i|how long/i.test(question)) return "deadline";
  if (/how much|cost|fee|price/i.test(question)) return "cost";
  if (/file (for )?(tax|a tax return)|submit (my )?tax|tax return/i.test(question)) return "howto";
  if (/how (do|can|should) i|steps|process/i.test(question)) return "howto";
  return "general";
}

function keywordQuery(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return Array.from(new Set(words)).slice(0, 8).join(" ");
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }
  return result;
}

export function interpretQuestion(question: string): Interpretation {
  const cleaned = question.replace(/\s+/g, " ").trim();
  const pack = TOPIC_PACKS.find((item) => item.match.test(cleaned));
  const intent = detectIntent(cleaned);
  const fallback =
    intent === "register"
      ? `You want to know what you may need to register for: ${cleaned}`
      : `You want official UK government guidance about: ${cleaned}`;

  return {
    question: cleaned,
    interpretation: pack?.interpretation ?? fallback,
    queries: unique([cleaned, keywordQuery(cleaned), ...(pack?.queries ?? [])]).slice(0, 5),
    preferredPaths: pack?.preferredPaths ?? [],
    topic: pack?.id ?? "general",
    intent,
  };
}
