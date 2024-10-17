/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React from 'react';

import BubbleField from './BubbleField';
import { AsyncSearchValues, AutocompleteFunction, AutocompleteOption, SearchEntry } from "./Types";
import { Operation, SearchTerm } from "../../api/Search";
import { IconButton, Stack } from "@mui/material";
import { Delete } from "@mui/icons-material";
import AsyncBubbleField from "./AsyncBubbleField";

const Bubble = ({
  config,
  index,
  onChange,
  search,
  setSearch,
  term,
}: {
  config: SearchEntry[];
  index: number;
  onChange: (value: SearchTerm) => void;
  search: SearchTerm[];
  setSearch: (search: SearchTerm[]) => void;
  term: SearchTerm;
}) => {
  const entry = config.find((o) => o.id === term.id)
    || config.find((o) => o.label === term.display)
    || config.find((o) => o.value === term.field)
  const fieldOptions = config.map(e => ({ id: e.id, label: e.label, value: e.id, field: e.value }));

  const operationOptions = entry?.operations || [];

  return (
    <Stack direction={"row"} spacing={"1em"}>
      <Stack
        direction={"row"}
        spacing={"0.25em"}
        alignContent={"flex-start"}
        alignItems={"center"}
        sx={{ padding: '0.5em', backgroundColor: '#eee' }}
        borderRadius={1}
      >
        <BubbleField
          className="field"
          options={fieldOptions}
          onChange={(option) => {
            onChange({
              ...term,
              id: fieldOptions.find((o) => o.value === option.value)?.id,
              field: fieldOptions.find((o) => o.value === option.value)?.field || '',
              display: option.label
            })
          }}
          value={term.id}
        />
        <BubbleField
          className="operation"
          options={operationOptions}
          onChange={(option) =>
            onChange({ ...term, op: option.value as Operation })
          }
          value={term.op}
        />
        {(entry?.values as AsyncSearchValues)?.query
          ? <AsyncBubbleField
            className="value"
            options={entry?.values as AsyncSearchValues}
            onChange={(option) =>
              onChange({ ...term, value: option.value })
            }
            term={term}
            value={term.value}
          />
          : <BubbleField
            className="value"
            options={entry?.values as AutocompleteOption[] | AutocompleteFunction}
            onChange={(option) => {
              onChange({ ...term, value: option.value })
            }}
            value={term.value}
          />
        }
        <IconButton onClick={() => {
          setSearch(search.filter((_, idx) => idx !== index));
        }}
        >
          <Delete color={"info"} cursor={"pointer"}/>
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default Bubble;
