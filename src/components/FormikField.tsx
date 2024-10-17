import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Popper,
  Select,
  TextField
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AsyncSearchValues } from "./search/Types";
import { Operation } from "../api/Search";
import apiFor from "../api/Api";

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
}

const getInPath = (obj: any, path: string): any => {
  const split = path.replace(/\[/g,'.').replace(/]/g,'').split('.');
  const local = split.splice(0, 1)[0];
  const val = obj[local];
  if (typeof val !== 'undefined' && split.length > 0) {
    return getInPath(val, split.join('.'))
  }
  return val;
}

const FormikField = ({
  formik,
  disabled = false,
  required = false,
  label,
  field,
  type,
  multiline = false,
  minRows = 3,
  maxRows = 10,
  options,
  async,
  autoComplete = 'none',
  dateFormat = "DD/MM/YYYY HH:mm"
}: {
  formik: any
  disabled?: boolean
  required?: boolean,
  label: string
  field: string
  type: 'text' | 'password' | 'email' | 'select' | 'datetime' | 'reference'
  multiline?: boolean
  minRows?: number,
  maxRows?: number,
  options?: SelectOption[],
  async?: AsyncSearchValues,
  autoComplete?: string
  dateFormat?: string
}) => {
  const [ inputValue, setInputValue ] = React.useState('');
  const [ loading, setLoading ] = useState(false);
  const [ asyncOptions, setAsyncOptions ] = useState<{ label: string, value: string }[]>([]);
  const [ value, setValue ] = useState<{ label: string, value: string }>({
    label: '',
    value: getInPath(formik.values, field)
  });
  const api = async ? apiFor(async.query.definition, async.query.context) : undefined;
  const [ initialized, setInitialized ] = useState(false);

  const load = (cb?: () => void) => {
    setLoading(true);
    api?.list({
      search: inputValue
        ? (async!.query.search || []).concat([
          { field: async!.label || 'name', op: Operation.Like, value: inputValue }
        ])
        : (async!.query.search || []),
      fields: async!.fields || [ async!.label || 'name', async!.value || 'id' ]
    }).then((data) => {
      const values = data?.content?.map((r) => {
        return async?.transform
          ? async.transform(r)
          : {
            label: (r as { [key: string]: unknown })[async?.label || 'name'],
            value: (r as { [key: string]: unknown })[async?.value || 'id']
          }
      }) as { label: string, value: string }[];

      setLoading(false);
      setAsyncOptions(values);
      if (cb) {
        cb();
      }
    });
  };

  useMemo(() => {
    if (api) {
      if (getInPath(formik.values, field)) {
        setLoading(true);
        api?.list({
          search: [ { field: async!.value || 'id', op: Operation.Equals, value: getInPath(formik.values, field) } ],
          fields: async!.fields || [ async!.label || 'name', async!.value || 'id' ]
        }).then((data) => {
          const selected = data.content[0] as { [key: string]: string };
          setValue({
            label: selected[async!.label || 'name'],
            value: selected[async!.value || 'id']
          });
          setLoading(false);
        });
      } else {
        load(() => setInitialized(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialized && api) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ inputValue ]);

  switch (type) {
    case "text":
    case "password":
    case "email":
      return (
        <TextField
          fullWidth
          required={required}
          disabled={disabled}
          label={label}
          name={field}
          type={type}
          multiline={multiline}
          minRows={minRows}
          maxRows={maxRows}
          autoComplete={autoComplete}
          value={getInPath(formik.values, field)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched[field] && Boolean(formik.errors[field])}
          helperText={formik.touched[field] && formik.errors[field]}
        />
      );
    case "reference":
      return (
        <FormControl disabled={disabled} error={formik.touched[field] && Boolean(formik.errors[field])}>
          <Autocomplete
            disabled={disabled}
            PopperComponent={(props) => <Popper {...props} style={{ width: "fit-content" }} placement="bottom-start"/>}
            disableClearable={true}
            options={asyncOptions}
            isOptionEqualToValue={(option, value) => true}
            filterOptions={(x) => x}
            autoSelect
            onChange={(_, v, b) => {
              setValue(v);
              formik.setFieldValue(field, v.value, true);
            }}
            value={value}
            openOnFocus
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
                  onBlur: formik.handleBlur,
                }}
              />
            }
            selectOnFocus
          />
          <FormHelperText>{formik.touched[field] && formik.errors[field]}</FormHelperText>
        </FormControl>
      );
    case "select":
      return (
        <FormControl disabled={disabled} error={formik.touched[field] && Boolean(formik.errors[field])}>
          <InputLabel id={field}>{label}</InputLabel>
          <Select
            required={required}
            labelId={field}
            label={label}
            name={field}
            value={getInPath(formik.values, field)}
            onChange={formik.handleChange}
            onClose={() => formik.setFieldTouched(field, true)}
            MenuProps={{ style: { zIndex: 9999999 } }}
          >
            {(options || []).map((o) =>
              (<MenuItem key={o.label} disabled={o.disabled} value={o.value!}>{o.label}</MenuItem>)
            )}
          </Select>
          <FormHelperText>{formik.touched[field] && formik.errors[field]}</FormHelperText>
        </FormControl>
      );
    case "datetime":
      return (
        <DateTimePicker
          disabled={disabled}
          label={label}
          name={field}
          value={dayjs(getInPath(formik.values, field))}
          onChange={(a) => {
            try {
              formik.setFieldValue(field, (a as Dayjs).toISOString(), true);
            } catch (e) {
              //Do nothing
            }
          }}
          ampm={false}
          format={dateFormat}
          slotProps={{
            textField: {
              variant: "outlined",
              required: required,
              onBlur: formik.handleBlur,
              error: formik.touched[field] && Boolean(formik.errors[field]),
              helperText: formik.touched[field] && formik.errors[field]
            }
          }}
        />
      );
  }
};

export default FormikField