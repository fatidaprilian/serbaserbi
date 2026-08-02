export interface ContractParty {
  name: string;
  address: string;
  role: string;
  representativeName?: string;
  representativeTitle?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
}

export interface ContractData {
  contractNumber: string;
  date: string;
  currency: "IDR" | "USD" | string;
  language: "id" | "en";
  projectTitle: string;
  projectValue: number;
  startDate: string;
  endDate: string;
  partyA: ContractParty;
  partyB: ContractParty;
  clauses: ContractClause[];
  notes?: string;
}
