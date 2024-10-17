/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Dialog, DialogContent, DialogProps, DialogTitle, IconButton, Stack } from "@mui/material";
import { Operation, SearchTerm, SortDirection, SortTerm } from "../api/Search";
import { Model } from "../api/models/Base";
import { ApizedContext, ApizedDefinition } from "../api/Api";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useEventBus } from "../lib/bus/EventBus";
import { useApiList } from "../api/ApiHooks";
import SearchBar from "./search/SearchBar";
import { SearchEntry } from "./search/Types";
import { getChangesBetweenArrays } from "../lib/json-diff";
import { Close } from "@mui/icons-material";
import ModelTable, { Column } from "./ModelTable";
import { convertTimeZone, toDateTimeString } from "../lib/DateTime";
import { useSearchParams } from "react-router-dom";

export type ApizedFormProps<T extends Model> = {
  isModal?: boolean;
  onClose?: (t?: T) => void;
  selected?: T;
}

const parseSearch = (searchTerms: SearchTerm[], search: string): SearchTerm[] => {
  const regExp = new RegExp(`(.*)(${Object.values(Operation).join('|')})(.*)`);
  return search.split(',')
    .map((t) => {
      const matches = regExp.exec(t);
      return matches ? {
        id: matches[1],
        field: searchTerms.find(t => t.id === matches[1])?.value,
        op: matches[2],
        value: matches[3]
      } : null;
    })
    .filter((o) => o) as SearchTerm[];
};

const searchToString = (search: SearchTerm[]): string => {
  return search
    .map(
      (t) =>
        `${t.id?.trim()}${t.op}${t.value === undefined ? '' : t.value}`,
    )
    .join(',');
}

const ApizedListPage = <T extends Model, F extends ApizedFormProps<T> = ApizedFormProps<T>>({
  actions = [],
  columns,
  context,
  fields,
  filter = [],
  form,
  formProps,
  onCreate,
  onRowClick,
  query,
  searchConfig,
  dialogProps = { fullWidth: true, maxWidth: "sm" },
  refetchTrigger = 0,
  disableCreatedAt = false
}: {
  actions?: {
    display: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained'
  }[];
  columns: Column<T>[];
  context: ApizedContext;
  fields?: string[];
  filter?: SearchTerm[];
  form?: (modal: F) => ReactNode
  formProps?: F
  onCreate?: () => void;
  onRowClick?: (item: T) => void;
  perPage?: number;
  query: ApizedDefinition<Model>;
  searchConfig: SearchEntry[];
  dialogProps?: Omit<DialogProps, 'open'>
  refetchTrigger?: number
  disableCreatedAt?: boolean
}): ReactElement => {
  const eventBus = useEventBus();
  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ page, setPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(5);
  const [ search, setSearch ] = useState<SearchTerm[]>(filter.concat(parseSearch(searchConfig, searchParams.get('q') || '')));
  const [ sort, setSort ] = useState<SortTerm[]>([ { field: "createdAt", direction: SortDirection.Desc } ]);
  const [ barSearch, setBarSearch ] = useState<SearchTerm[]>(parseSearch(searchConfig, searchParams.get('q') || ''));
  const [ modalState, setModalState ] = useState<{ open: boolean, selected?: T }>({ open: false })

  useEffect(() => {
    if (refetchTrigger !== 0) {
      refetch();
    }
  }, [ refetchTrigger ]);


  const { data: results, loading, refetch } = useApiList<T>(
    query,
    context,
    {
      page,
      pageSize,
      fields: !disableCreatedAt && fields ? [ 'createdAt' ].concat(fields) : fields,
      search,
      sort
    }
  )

  const actualColumns = disableCreatedAt ? columns : [ {
    label: 'Created At',
    sort: 'createdAt',
    minWidth: 120,
    format: (value) => toDateTimeString(convertTimeZone({ date: new Date(value.createdAt!), from: 'UTC', to: '' }))
  } as Column<T> ].concat(columns);
  const entries: T[] = results?.content || [];

  useEffect(() => eventBus.effect('login-success', refetch), [ eventBus, refetch ]);

  if (!loading && !entries.length) {
    eventBus.dispatch('user-refetch');
  }

  return (
    <Stack spacing={"1em"}>
      <Stack direction={"row"} spacing={"1em"} alignItems={"center"}>
        <SearchBar
          config={searchConfig}
          search={barSearch}
          setSearch={(terms) => {
            const filtered = terms.filter(
              (term) => term.field && term.op && term.value !== undefined,
            ).map((term) => ({ ...term, value: term.value === null ? undefined : term.value }));
            if (Object.keys(getChangesBetweenArrays(search, filtered)).length) {
              setSearch(filter.concat(filtered));
            }
            console.log(terms)
            setBarSearch(terms);
            setSearchParams(filtered.length ? { q: searchToString(filtered) } : {})
          }}
          refresh={refetch}
          loading={loading}
        />
      </Stack>
      <Stack direction={"row"} spacing={"1em"} justifyContent={"space-between"}>
        <Stack direction={"row"} spacing={"1em"} alignItems={"center"} justifyContent={"left"}>
          <>
            {actions.map((action) =>
              (<Button
                key={action.display}
                variant={action.variant || 'contained'}
                onClick={action.onClick}
              >
                {action.display}
              </Button>)
            )}
          </>
        </Stack>
        <Stack direction={"row"} spacing={"1em"} alignItems={"center"} justifyContent={"right"}>
          {(form || onCreate) && (
            <Box>
              <Button
                variant={"contained"}
                onClick={() => {
                  onCreate ? onCreate() : setModalState({ open: true, selected: undefined })
                }}
              >
                Create
              </Button>
            </Box>
          )}
        </Stack>
      </Stack>
      <ModelTable
        columns={actualColumns}
        entries={entries}
        loading={loading}
        page={page}
        sort={sort}
        setSort={setSort}
        onRowClick={(model) => {
          onRowClick ? onRowClick(model) : setModalState({ open: true, selected: model });
        }}
        handleChangePage={(newPage) => setPage(newPage + 1)}
        handleChangeRowsPerPage={(pageSize) => {
          setPageSize(pageSize);
          setPage(1)
        }}
        pageSize={pageSize}
        total={results?.total}
      />
      <Dialog
        {...dialogProps}
        open={modalState.open}
      >
        <DialogTitle>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
          >
            <span>{modalState.selected ? 'Edit' : 'Create'}</span>
            <IconButton onClick={() => setModalState({ open: false, selected: undefined })}><Close/></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: '1em' }}>
            {form && form({
              ...formProps,
              isModal: true,
              onClose: (t) => {
                setModalState({ open: false, selected: undefined });
                if (t) {
                  refetch();
                }
              },
              selected: modalState.selected
            } as F)}
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default ApizedListPage;
