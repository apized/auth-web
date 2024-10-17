import React from 'react';

import { AutocompleteFunction, AutocompleteOption } from "./Types";
import { Autocomplete, Box, Popper, TextField } from "@mui/material";

const BubbleField = ({
  className,
  onChange,
  options,
  value,
}: {
  className: string;
  label?: string;
  onChange: (value: AutocompleteOption) => void;
  options: AutocompleteOption[] | AutocompleteFunction;
  value?: string
}) => {
  const selectOption = (option: AutocompleteOption) => {
    onChange(option);
  };
  const actualOptions = (typeof options === 'function' ? options(value) : (options || [])) as AutocompleteOption[];
  const label = `${className.charAt(0).toUpperCase()}${className.slice(1)}`;
  console.log(value)

  return (
    <Box sx={{ minWidth: '10em' }}>
      <Autocomplete
        PopperComponent={(props) => <Popper {...props} style={{ width: "fit-content" }} placement="bottom-start"/>}
        disableClearable={true}
        options={actualOptions || []}
        autoSelect
        onChange={(_, v, b) => selectOption(v as AutocompleteOption)}
        openOnFocus
        size={"small"}
        renderInput={(params) => <TextField {...params} label={label}/>}
        selectOnFocus
        value={actualOptions?.find((o) => o.value === value) || (
          typeof options !== 'function' && (options || []).length === 0 && typeof value !== 'undefined'
            ? { label: value, value: value }
            : { label: '' })}
        onInputChange={(_, text) => {
          if (typeof options === 'function' || (typeof options !== 'function' && (options || []).length === 0)) {
            actualOptions.splice(0, actualOptions.length, ...(
              typeof options === 'function'
                ? options(text)
                : [ { label: text, value: text } ]
            ));
          }
        }}
      />
    </Box>
  );
};

export default BubbleField;
