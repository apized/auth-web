/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import { SearchTerm } from "../api/Search";
import { Model } from "../api/models/Base";
import { ApizedContext, ApizedDefinition } from "../api/Api";
import { ReactElement, useEffect, useState } from "react";
import { useEventBus } from "../lib/bus/EventBus";
import { useApiList } from "../api/ApiHooks";
import SearchBar from "./search/SearchBar";
import { SearchEntry } from "./search/Types";
import { getChangesBetweenArrays } from "../lib/json-diff";

export interface Column<T extends Model> {
  label: string;
  format: (value: T) => any;
  minWidth?: number;
  align?: 'right';
}

const ApiModelListPage = <T extends Model>({
  columns,
  context,
  filter = [],
  onCreate,
  onRowClick = () => null,
  query,
  fields,
  searchConfig,
}: {
  columns: Column<T>[];
  context: ApizedContext;
  fields?: string[];
  filter?: SearchTerm[];
  onCreate?: () => void;
  onRowClick?: (item: T) => void;
  perPage?: number;
  query: ApizedDefinition<Model>;
  searchConfig: SearchEntry[];
}): ReactElement => {
  const eventBus = useEventBus();
  const [ page, setPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(10);
  const [ search, setSearch ] = useState<SearchTerm[]>(filter);
  const [ barSearch, setBarSearch ] = useState<SearchTerm[]>([]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(+event.target.value);
    setPage(0);
  };

  const { data: results, loading, refetch } = useApiList<T>(
    query,
    context,
    {
      page,
      pageSize,
      fields,
      search
    }
  )

  const entries: T[] = results?.content || [];

  useEffect(() =>eventBus.effect('login-success', refetch), [ eventBus, refetch ]);

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
            const filtered = filter.concat(terms.filter(
              (term) => term.field && term.op && term.value !== undefined,
            ));
            if (Object.keys(getChangesBetweenArrays(search, filtered)).length) {
              setSearch(filtered);
            }
            setBarSearch(terms);
          }}
        />
      </Stack>
      <Stack direction={"row"} spacing={"1em"} alignItems={"center"} justifyContent={"right"}>
        {onCreate && <Box>
            <Button variant={"contained"} onClick={() => onCreate()}>Create</Button>
        </Box>}
      </Stack>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.label}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    <b>
                      {column.label}
                    </b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((model) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={model.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onRowClick(model)}
                  >
                    {columns.map((column) => {
                      return (
                        <TableCell key={`${model.id}-${column.label}`} align={column.align}>
                          {column.format(model)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[ 10, 20 ]}
          component="div"
          count={results?.total || 0}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
};

export default ApiModelListPage;
