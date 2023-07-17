import { Operation } from "../../api/Search";
import { Model } from "../../api/models/Base";
import { ApizedContext, ApizedDefinition } from "../../api/Api";

export type SearchEntry = {
  label: string;
  operations: { label: string; value: Operation }[];
  value: string;
  values?:
    | AutocompleteOption[]
    | AsyncSearchValues
    | ((text: string) => AutocompleteOption[]);
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
  search?: SearchEntry[];
}

export type AsyncSearchValues = {
  // create?: boolean;
  label?: string;
  query: ApizedAsyncQuery;
  // transform?: (value: unknown) => unknown;
  value?: string;
};
