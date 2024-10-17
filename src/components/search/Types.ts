import { Operation, SearchTerm } from "../../api/Search";
import { Model } from "../../api/models/Base";
import { ApizedContext, ApizedDefinition } from "../../api/Api";

export type AutocompleteFunction = (text?: string) => AutocompleteOption[];

export type SearchEntry = {
  id: string;
  label: string;
  operations: { label: string; value: Operation }[];
  value: string;
  values?:
    | AutocompleteOption[]
    | AsyncSearchValues
    | AutocompleteFunction;
};

export enum Section {
  Field,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Operation,
  Value,
  Choice,
}

export type AutocompleteOption = {
  isDisabled?: boolean;
  label: string;
  value?: string | null;
};

export type SearchLocation = {
  bubble: number;
  section: Section;
};

export type ApizedAsyncQuery = {
  context: ApizedContext;
  definition: ApizedDefinition<Model>;
  search?: SearchTerm[];
}

export type AsyncSearchValues = {
  create?: boolean;
  extra?: (term: SearchTerm, input: string) => AutocompleteOption[];
  label?: string;
  fields?: string[];
  query: ApizedAsyncQuery;
  transform?: (value: unknown) => unknown;
  // transform?: {
  //   forward: (value: unknown) => unknown;
  //   reverse: (value: unknown) => unknown;
  // }
  value?: string;
};
