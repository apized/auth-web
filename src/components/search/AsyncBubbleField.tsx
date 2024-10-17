import React, { useEffect, useState } from 'react';

import { AsyncSearchValues, AutocompleteOption } from "./Types";
import { Operation, SearchTerm } from "../../api/Search";
import { Autocomplete, Box, CircularProgress, Popper, TextField } from "@mui/material";
import { useApiList } from "../../api/ApiHooks";

const AsyncBubbleField = ({
  className,
  onChange,
  options,
  value,
  term
}: {
  className: string,
  label?: string,
  onChange: (value: AutocompleteOption) => void,
  options: AsyncSearchValues,
  value: string,
  term: SearchTerm
}) => {
  const selectOption = (option: AutocompleteOption) => {
    onChange(option);
  };
  const [ ready, setReady ] = useState(false);
  const [ inputValue, setInputValue ] = useState(value || '');
  const [ selection, setSelection ] = useState<AutocompleteOption>();

  const { data, loading } = useApiList<any>(options.query.definition, options.query.context, {
    search: inputValue ? (options.query.search || []).concat([ {
      field: options.label || 'name',
      op: Operation.Like,
      value: inputValue
    } ]) : (options.query.search || []),
    fields: options.fields || [ options.label || 'name', options.value || 'id' ]
  })

  const filteredOptions = loading
    ? []
    : (data?.content?.map((r) => {
      return options.transform
        ? options.transform(r)
        : {
          label: r[options.label || 'name'],
          value: r[options.value || 'id']
        }
    }) as AutocompleteOption[])
      .concat(options.extra ? options.extra(term, inputValue) : [])
      .unique((o) => "" + o.value);
  //todo we don't want unique here, we want to get a distinct from the server

  const label = `${className.charAt(0).toUpperCase()}${className.slice(1)}`;

  useEffect(() => {
    if (!ready && !loading) {
      setReady(true);
      if (value) {
        const selectedOption = filteredOptions?.find((o) => o.value === inputValue);
        if (selectedOption) {
          setSelection(selectedOption)
          setInputValue(value);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ ready, loading, value ]);

  return (
    <Box sx={{ minWidth: '10em' }}>
      <Autocomplete
        PopperComponent={(props) => <Popper {...props} style={{ width: "fit-content" }} placement="bottom-start"/>}
        disableClearable={true}
        options={filteredOptions}
        isOptionEqualToValue={(option, value) => true}
        filterOptions={(opts, params) => {
          const { inputValue: label } = params;
          if (options.create && label !== '' && !filteredOptions.some((option) => label === option.label)) {
            opts.push({
              label,
              value: label,
            });
          }
          return opts;
        }}
        // autoSelect
        onChange={(_, v, b) => {
          const option = v as AutocompleteOption;
          setInputValue(option.label)
          setSelection(option)
          selectOption(option)
        }}
        openOnFocus
        size={"small"}
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
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
          />
        }
        inputValue={inputValue}
        value={selection || { label: '' }}
      />
    </Box>
  );
};

export default AsyncBubbleField;
