import { categoryFromCpv } from "./categories";
import { encodeTenderId } from "./ids";
import type { CpvCode, Tender, TenderStatus, TenderValue } from "./types";
import { asBoolean, asNumber, asRecord, asString, asStringArray, firstString, unique } from "../format/text";

function parseCpv(codes: unknown, descriptions?: unknown): CpvCode[] {
  const descList = asStringArray(descriptions);
  if (Array.isArray(codes) && codes.every((item) => typeof item === "object" && item)) {
    const parsed: CpvCode[] = [];
    for (const item of codes as unknown[]) {
      const record = asRecord(item);
      const code = firstString(record?.code, record?.id);
      if (!code) continue;
      parsed.push({ code, description: asString(record?.description) });
    }
    return parsed;
  }

  const rawCodes = asStringArray(codes).flatMap((value) => value.split(/\s+/));
  return unique(rawCodes).map((code, index) => ({
    code,
    description: descList[index] || descList[0],
  }));
}

function mapCfStatus(status?: string, type?: string, deadline?: string): TenderStatus {
  const normalised = (status || "").toLowerCase();
  const noticeType = (type || "").toLowerCase();
  if (noticeType.includes("pipeline") || normalised.includes("planned") || normalised.includes("future")) {
    return "planning";
  }
  if (normalised.includes("award")) return "awarded";
  if (normalised.includes("close") || normalised.includes("withdraw") || normalised.includes("let")) return "closed";
  if (normalised.includes("open") || normalised.includes("active")) {
    if (deadline && new Date(deadline).getTime() < Date.now()) return "closed";
    return "open";
  }
  if (deadline && new Date(deadline).getTime() < Date.now()) return "closed";
  return normalised ? "unknown" : "unknown";
}

function mapOcdsStatus(tag: string[] | undefined, tenderStatus?: string, deadline?: string): TenderStatus {
  const tags = (tag || []).map((item) => item.toLowerCase());
  const status = (tenderStatus || "").toLowerCase();
  if (tags.includes("planning") || status.includes("planned") || status === "planning") return "planning";
  if (tags.includes("award") || status.includes("complete") || status.includes("awarded")) return "awarded";
  if (status.includes("cancelled") || status.includes("unsuccessful") || status.includes("withdrawn")) return "closed";
  if (tags.includes("tender") || status === "active") {
    if (deadline && new Date(deadline).getTime() < Date.now()) return "closed";
    return "open";
  }
  if (deadline && new Date(deadline).getTime() < Date.now()) return "closed";
  return "unknown";
}

function valueFromRange(low?: number, high?: number, currency = "GBP"): TenderValue | undefined {
  const min = low && low > 0 ? low : undefined;
  const max = high && high > 0 ? high : undefined;
  if (min === undefined && max === undefined) return undefined;
  return { min, max, currency };
}

export function normalizeContractsFinderItem(raw: unknown): Tender | null {
  const wrapper = asRecord(raw);
  const item = asRecord(wrapper?.item) ?? wrapper;
  if (!item) return null;

  const nativeId = firstString(item.id, item.Id);
  const title = firstString(item.title, item.Title);
  if (!nativeId || !title) return null;

  const deadline = firstString(item.deadlineDate, item.DeadlineDate);
  const publishedAt = firstString(item.publishedDate, item.PublishedDate);
  const updatedAt = firstString(item.lastNotifableUpdate, item.lastNotifiableUpdate, item.LastNotifiableUpdate);
  const cpvCodes = parseCpv(item.cpvCodes ?? item.CpvCodes, item.cpvDescription ?? item.CpvDescription);
  const region = firstString(item.region, item.Region, item.regionText, item.RegionText);
  const postcode = firstString(item.postcode, item.Postcode);
  const noticeType = firstString(item.noticeType, item.NoticeType, item.type, item.Type);
  const noticeStatus = firstString(item.noticeStatus, item.NoticeStatus, item.status, item.Status);

  return {
    id: encodeTenderId("contracts-finder", nativeId),
    source: "contracts-finder",
    sourceUrl: `https://www.contractsfinder.service.gov.uk/Notice/${nativeId}`,
    sourceLabel: "Contracts Finder",
    title,
    description: firstString(item.description, item.Description),
    buyer: {
      name: firstString(item.organisationName, item.OrganisationName) || "Buyer not named in notice",
    },
    status: mapCfStatus(noticeStatus, noticeType, deadline),
    publishedAt,
    updatedAt,
    deadline,
    contractStart: firstString(item.start, item.Start),
    contractEnd: firstString(item.end, item.End),
    value: valueFromRange(asNumber(item.valueLow ?? item.ValueLow), asNumber(item.valueHigh ?? item.ValueHigh)),
    locations: unique([region, postcode]),
    cpvCodes,
    category: categoryFromCpv(cpvCodes),
    suitableForSME: asBoolean(item.isSuitableForSme ?? item.IsSuitableForSme),
    suitableForVCSE: asBoolean(item.isSuitableForVco ?? item.IsSuitableForVco),
    procurementStage: noticeStatus,
    noticeType,
    reference: firstString(item.noticeIdentifier, item.NoticeIdentifier, item.identifier),
    noticeId: nativeId,
    relevanceScore: asNumber(wrapper?.score),
  };
}

export function normalizeContractsFinderNotice(raw: unknown): Tender | null {
  const root = asRecord(raw);
  if (!root) return null;
  const notice = asRecord(root.notice) ?? root;
  const summary = normalizeContractsFinderItem({
    ...notice,
    lastNotifiableUpdate: firstString(root.lastUpdatedDate, notice.lastNotifiableUpdate),
    organisationName: firstString(asRecord(root.organisation)?.name, notice.organisationName),
  });
  if (!summary) return null;

  const additional = Array.isArray(root.additionalDetails) ? root.additionalDetails : [];
  const additionalText: string[] = [];
  const documents: Tender["documents"] = [];

  for (const detail of additional) {
    const record = asRecord(detail);
    if (!record) continue;
    const text = firstString(record.textData, record.description);
    const link = asString(record.link);
    const type = asString(record.dataType);
    if (link) {
      documents.push({
        title: firstString(record.description, "Related document") || "Related document",
        url: link.startsWith("https://") || link.startsWith("http://") ? link : undefined,
        type,
      });
    } else if (text) {
      additionalText.push(text);
    }
  }

  const cpvFromRoot = parseCpv(root.cpvCodes, notice.cpvDescription);
  const contact = asRecord(notice.contactDetails);

  return {
    ...summary,
    updatedAt: firstString(root.lastUpdatedDate, summary.updatedAt),
    buyer: {
      name: firstString(asRecord(root.organisation)?.name, summary.buyer.name) || summary.buyer.name,
    },
    cpvCodes: cpvFromRoot.length ? cpvFromRoot : summary.cpvCodes,
    category: categoryFromCpv(cpvFromRoot.length ? cpvFromRoot : summary.cpvCodes) || summary.category,
    procedureType: firstString(notice.procedureType, notice.procedureTypeOther),
    additionalText,
    documents: documents.length ? documents : undefined,
    locations: unique([
      ...(summary.locations ?? []),
      firstString(notice.region),
      firstString(asRecord(notice.location)?.region),
      notice.nationwide === true ? "UK-wide" : undefined,
      firstString(contact?.town, contact?.address2, contact?.postcode),
    ]),
  };
}

function ocdsCpv(tender: Record<string, unknown>): CpvCode[] {
  const codes: CpvCode[] = [];
  const classification = asRecord(tender.classification);
  if (classification) {
    const code = firstString(classification.id);
    if (code) codes.push({ code, description: asString(classification.description) });
  }
  const items = Array.isArray(tender.items) ? tender.items : [];
  for (const item of items) {
    const record = asRecord(item);
    const extra = Array.isArray(record?.additionalClassifications) ? record.additionalClassifications : [];
    for (const classificationItem of extra) {
      const cls = asRecord(classificationItem);
      const code = firstString(cls?.id);
      if (code) codes.push({ code, description: asString(cls?.description) });
    }
  }
  return codes.filter((item, index, list) => list.findIndex((other) => other.code === item.code) === index);
}

function ocdsLocations(tender: Record<string, unknown>, parties: unknown): string[] {
  const locations: Array<string | undefined> = [];
  const items = Array.isArray(tender.items) ? tender.items : [];
  for (const item of items) {
    const record = asRecord(item);
    const addresses = Array.isArray(record?.deliveryAddresses) ? record.deliveryAddresses : [];
    for (const address of addresses) {
      const addr = asRecord(address);
      locations.push(firstString(addr?.region, addr?.locality, addr?.postalCode, addr?.countryName));
    }
  }
  const partyList = Array.isArray(parties) ? parties : [];
  for (const party of partyList) {
    const record = asRecord(party);
    const roles = asStringArray(record?.roles);
    if (!roles.includes("buyer")) continue;
    const addr = asRecord(record?.address);
    locations.push(firstString(addr?.region, addr?.locality, addr?.postalCode));
  }
  return unique(locations);
}

function ocdsDocuments(tender: Record<string, unknown>): Tender["documents"] {
  const docs = Array.isArray(tender.documents) ? tender.documents : [];
  const result: NonNullable<Tender["documents"]> = [];
  for (const doc of docs) {
    const record = asRecord(doc);
    if (!record) continue;
    const title = firstString(record.title, record.description, record.documentType, record.id);
    if (!title) continue;
    const url = asString(record.url);
    result.push({
      title,
      url: url && (url.startsWith("https://") || url.startsWith("http://")) ? url : undefined,
      type: asString(record.documentType),
    });
  }
  return result.length ? result : undefined;
}

function ocdsCriteria(tender: Record<string, unknown>): string[] {
  const selection = asRecord(tender.selectionCriteria);
  const criteria = Array.isArray(selection?.criteria) ? selection.criteria : [];
  return criteria
    .map((item) => {
      const record = asRecord(item);
      return firstString(record?.description, record?.type);
    })
    .filter((item): item is string => Boolean(item));
}

function ocdsLots(tender: Record<string, unknown>): string[] | undefined {
  const lots = Array.isArray(tender.lots) ? tender.lots : [];
  const titles = lots
    .map((item) => {
      const record = asRecord(item);
      return firstString(record?.title, record?.description);
    })
    .filter((item): item is string => Boolean(item));
  return titles.length ? titles : undefined;
}

export function normalizeFindATenderRelease(raw: unknown): Tender | null {
  const release = asRecord(raw);
  if (!release) return null;
  const tender = asRecord(release.tender) ?? {};
  const ocid = firstString(release.ocid);
  const title = firstString(tender.title, release.description);
  if (!ocid || !title) return null;

  const period = asRecord(tender.tenderPeriod);
  const deadline = firstString(period?.endDate, asRecord(tender.awardPeriod)?.endDate);
  const noticeId = firstString(release.id);
  const valueRecord = asRecord(tender.value);
  const minValue = asRecord(tender.minValue);
  const amount = asNumber(valueRecord?.amount);
  const minAmount = asNumber(minValue?.amount);
  const currency = firstString(valueRecord?.currency, minValue?.currency) || "GBP";
  const cpvCodes = ocdsCpv(tender);
  const tags = Array.isArray(release.tag) ? release.tag.map((item) => String(item)) : undefined;
  const buyer = asRecord(release.buyer);

  const sourceUrl = noticeId
    ? `https://www.find-tender.service.gov.uk/Notice/${noticeId}`
    : `https://www.find-tender.service.gov.uk/`;

  return {
    id: encodeTenderId("find-a-tender", ocid),
    source: "find-a-tender",
    sourceUrl,
    sourceLabel: "Find a Tender",
    title,
    description: firstString(tender.description, release.description),
    buyer: {
      name: firstString(buyer?.name) || "Buyer not named in notice",
      identifier: firstString(buyer?.id),
    },
    status: mapOcdsStatus(tags, asString(tender.status), deadline),
    publishedAt: firstString(release.date),
    updatedAt: firstString(release.date),
    deadline,
    value: valueFromRange(minAmount, amount, currency) ?? (amount ? { max: amount, currency } : undefined),
    locations: ocdsLocations(tender, release.parties),
    cpvCodes,
    category: categoryFromCpv(cpvCodes),
    procurementStage: tags?.[0] || asString(tender.status),
    procedureType: firstString(tender.procurementMethodDetails, tender.procurementMethod),
    ocid,
    reference: firstString(tender.id, noticeId),
    noticeId,
    lots: ocdsLots(tender),
    documents: ocdsDocuments(tender),
    selectionCriteria: ocdsCriteria(tender),
    contractStart: firstString(asRecord(tender.contractPeriod)?.startDate),
    contractEnd: firstString(asRecord(tender.contractPeriod)?.endDate),
  };
}

export function normalizeFindATenderPackage(raw: unknown): Tender | null {
  const root = asRecord(raw);
  if (!root) return null;
  const records = Array.isArray(root.records) ? root.records : [];
  const record = asRecord(records[0]);
  const compiled = record?.compiledRelease ?? (Array.isArray(root.releases) ? root.releases[0] : undefined);
  return compiled ? normalizeFindATenderRelease(compiled) : null;
}

export function sortTenders(tenders: Tender[], requested?: string): Tender[] {
  const mode = requested || "best-match";
  const copy = [...tenders];
  copy.sort((a, b) => {
    if (mode === "deadline-soonest") {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    }
    if (mode === "newly-published") {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    }
    if (mode === "highest-value") {
      return valueScore(b) - valueScore(a);
    }
    if (mode === "lowest-value") {
      const aScore = valueScore(a);
      const bScore = valueScore(b);
      if (aScore < 0 && bScore < 0) return 0;
      if (aScore < 0) return 1;
      if (bScore < 0) return -1;
      return aScore - bScore;
    }
    const aScore = a.relevanceScore ?? 0;
    const bScore = b.relevanceScore ?? 0;
    if (aScore !== bScore) return bScore - aScore;
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
  return copy;
}

function valueScore(tender: Tender): number {
  const max = tender.value?.max;
  const min = tender.value?.min;
  if (typeof max === "number" && max > 0) return max;
  if (typeof min === "number" && min > 0) return min;
  return -1;
}

export { mapCfStatus, mapOcdsStatus };
