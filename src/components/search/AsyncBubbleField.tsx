import React from 'react';

// import AutoComplete from './AutoComplete';
import { AsyncSearchValues, AutocompleteOption } from "./Types";
import { Operation } from "../../api/Search";
import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { useApiList } from "../../api/ApiHooks";

const AsyncBubbleField = ({
  className,
  onChange,
  options,
}: {
  className: string;
  label?: string;
  onChange: (value: AutocompleteOption) => void;
  options: AsyncSearchValues;
}) => {
  const selectOption = (option: AutocompleteOption) => {
    onChange(option);
  };
  const [ inputValue, setInputValue ] = React.useState('');
  const { data, loading } = useApiList<any>(options.query.definition, options.query.context, {
    search: inputValue ? [ { field: options.label || 'name', op: Operation.Like, value: inputValue } ] : [],
    fields: [ options.label || 'name', options.value || 'id' ]
  })
  const filteredOptions = loading ? [] : data?.content?.map((r) => {
    return {
      label: r[options.label || 'name'],
      value: r[options.value || 'id']
    }
  });

  const label = `${className.charAt(0).toUpperCase()}${className.slice(1)}`;

  return (
    <Box sx={{ minWidth: '10em' }}>
      <Autocomplete
        disableClearable={true}
        options={filteredOptions}
        isOptionEqualToValue={(option, value) => true}
        filterOptions={(x) => x}
        autoSelect
        onChange={(_, v, b) => selectOption(v as AutocompleteOption)}
        openOnFocus
        size={"small"}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) =>
          <TextField
            {...params}
            label={label}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20}/> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        }
        selectOnFocus
      />
    </Box>
  );
};

export default AsyncBubbleField;
