import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from "@mui/material";
import React from "react";
import { SortDirection, SortTerm } from "../api/Search";
import { Model } from "../api/models/Base";

export interface Column<T extends Model> {
  label: string
  format: (value: T) => any
  sort?: string
  minWidth?: number
  align?: 'right'
}

const ModelTable = <T extends Model>({
  columns,
  entries,
  loading,
  onRowClick = () => undefined,
  handleChangePage = () => undefined,
  handleChangeRowsPerPage = () => undefined,
  page,
  pageSize,
  setSort,
  sort,
  total
}: {
  columns: Column<T>[]
  entries: T[]
  handleChangePage?: (newPage: number) => void
  handleChangeRowsPerPage?: (pageSize: number) => void
  loading: boolean
  onRowClick?: (item: T) => void
  page?: number
  pageSize?: number
  setSort?: (sort: SortTerm[]) => void
  sort?: SortTerm[]
  total?: number
}) => {
  return (
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
                  sortDirection={sort && sort[0].field === column.sort ? (sort[0].direction === SortDirection.Asc ? "asc" : "desc") : false}
                >
                  {sort && column.sort && typeof setSort !== 'undefined'
                    ? <TableSortLabel
                      active={sort[0].field === column.sort}
                      direction={sort[0].direction === SortDirection.Asc ? "asc" : "desc"}
                      onClick={() => {
                        setSort([ {
                          field: column.sort,
                          direction: sort[0].direction === SortDirection.Desc ? SortDirection.Asc : SortDirection.Desc
                        } ]);
                      }}
                    >
                      <b> {column.label}</b>
                    </TableSortLabel>
                    : <b> {column.label}</b>}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && entries.map((model) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={model.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onRowClick(model);
                  }}
                >
                  {columns.map((column) => {
                    return (
                      <TableCell key={`${model.id}-${column.label}`} align={column.align}
                                 style={{ minHeight: '2.6em' }}>
                        <div style={{
                          minHeight: '2.6em',
                          display: 'flex',
                          alignItems: 'center'
                        }}>{column.format(model)}</div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {loading && [ ...Array(pageSize).keys() ].map((idx) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={idx}
                >
                  {columns.map((column) => <TableCell key={`shimmer-${idx}-${column.label}`} align={column.align}>
                    <div style={{ minHeight: '2.6em' }} className={"shimmer"}>&nbsp;</div>
                  </TableCell>)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {handleChangePage && handleChangeRowsPerPage && page && pageSize &&
        <TablePagination
          rowsPerPageOptions={[ 5, 10, 20, 50, 100 ]}
          component="div"
          count={total || 0}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={(_, idx) => handleChangePage(idx)}
          onRowsPerPageChange={(e) => handleChangeRowsPerPage(+e.target.value)}
        />
      }
    </Paper>
  )
    ;
};

export default ModelTable;