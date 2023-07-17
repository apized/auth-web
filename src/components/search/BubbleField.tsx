import React from 'react';

// import AutoComplete from './AutoComplete';
import { AutocompleteOption } from "./Types";
import { Autocomplete, Box, TextField } from "@mui/material";

const BubbleField = ({
  className,
  onChange,
  options,
}: {
  className: string;
  label?: string;
  onChange: (value: AutocompleteOption) => void;
  options: AutocompleteOption[];
}) => {
  const selectOption = (option: AutocompleteOption) => {
    onChange(option);
  };

  const label = `${className.charAt(0).toUpperCase()}${className.slice(1)}`;

  return (
    <Box sx={{ minWidth: '10em' }}>
      <Autocomplete
        disableClearable={true}
        options={(options || []) as AutocompleteOption[]}
        autoSelect
        onChange={(_, v, b) => selectOption(v as AutocompleteOption)}
        openOnFocus
        size={"small"}
        renderInput={(params) => <TextField {...params} label={label}/>}
        selectOnFocus
      />
    </Box>
  );
};

export default BubbleField;
