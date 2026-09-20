export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "contracting-authority",
    term: "Contracting authority",
    definition:
      "A public-sector organisation that buys goods, works or services. Examples include government departments, NHS bodies, local authorities, schools and some publicly funded organisations.",
  },
  {
    id: "supplier",
    term: "Supplier",
    definition:
      "An organisation or person that wants to sell to a contracting authority. This can include companies, sole traders, charities, CICs and consortia.",
  },
  {
    id: "procurement",
    term: "Procurement",
    definition:
      "The process a public body uses to buy goods, works or services. It includes planning, advertising, selecting suppliers, awarding a contract and managing delivery.",
  },
  {
    id: "tender",
    term: "Tender",
    definition:
      "A request for suppliers to submit an offer. In everyday language people also use “tender” for the opportunity itself, the documents, or the bid they submit.",
  },
  {
    id: "pipeline-notice",
    term: "Pipeline notice",
    definition:
      "An early notice that a public body expects to buy something in future. It is not usually an invitation to bid yet. It helps suppliers prepare.",
  },
  {
    id: "tender-notice",
    term: "Tender notice",
    definition:
      "A published notice that a procurement is open, or about to open, for suppliers to respond. Always read the linked documents, not only the summary.",
  },
  {
    id: "award-notice",
    term: "Award notice",
    definition:
      "A notice that a contract, or a place on a framework, has been awarded. It is useful for market insight, not usually an open opportunity.",
  },
  {
    id: "framework",
    term: "Framework",
    definition:
      "An agreement with one or more suppliers that sets terms for future work. Buyers may then call off contracts without running a full new competition every time.",
  },
  {
    id: "dynamic-market",
    term: "Dynamic market",
    definition:
      "A list of suppliers that can remain open to new applicants. Buyers may then run further competitions among those suppliers. Rules and names vary by regime.",
  },
  {
    id: "cpv",
    term: "CPV",
    definition:
      "Common Procurement Vocabulary. A standard set of codes used to classify what is being bought, such as software, construction or social care. Codes help you search, but they are not a guarantee of relevance.",
  },
  {
    id: "sme",
    term: "SME",
    definition:
      "Small or medium-sized enterprise. Notices may flag opportunities as suitable for SMEs. That flag is a buyer indication, not an automatic eligibility decision.",
  },
  {
    id: "vcse",
    term: "VCSE",
    definition:
      "Voluntary, community and social enterprise. This can include charities, community interest companies and similar organisations. A VCSE-suitable flag is not a guarantee of eligibility.",
  },
  {
    id: "lots",
    term: "Lots",
    definition:
      "Parts of a larger procurement. A buyer may split work so suppliers can bid for one or more lots rather than the whole contract.",
  },
  {
    id: "estimated-value",
    term: "Estimated value",
    definition:
      "The buyer’s published estimate of what the contract may be worth. It can be a range, a single figure, or missing. It is not a guaranteed payment.",
  },
  {
    id: "clarification-deadline",
    term: "Clarification deadline",
    definition:
      "The last point at which suppliers can usually ask questions about the documents. It is often earlier than the submission deadline. If it is not stated in the notice, check the documents.",
  },
  {
    id: "contract-award",
    term: "Contract award",
    definition:
      "The point at which a buyer selects a supplier and enters a contract. Award notices record this publicly. Until then, an open notice is still only an opportunity.",
  },
  {
    id: "procurement-stage",
    term: "Procurement stage",
    definition:
      "Where the process sits in its lifecycle. Common stages include planning, tender, award and implementation. TenderLens maps these from official data rather than inventing a stage.",
  },
];
