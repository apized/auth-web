import styled from 'styled-components';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { diff, isNotNull, isObject } from "../../lib/json-diff";
import React, { ReactNode, useMemo, useState } from "react";
import { ApizedAuditEntry } from "../../api/models/Base";
import apiFor, { Service } from "../../api/Api";
import DiffTreeNode from "./DiffTreeNode";
import { Apis } from "../../api/Config";
import { Async, AsyncProps } from "react-async";
import { Column } from "../ModelTable";

const DiffContainer = styled.div`
  li {
    opacity: 0.9;
    list-style: none;
    cursor: default;

    &:hover {
      opacity: 1;
    }
  }

  .label,
  .separator,
  .value {
    padding: 0.5em 0.25em;
  }

  .label {
    position: relative;
    white-space: nowrap;
    border-radius: 1em;
    padding: 0.5em 1em;

    &.collapsed::after {
      content: '+';
    }

    &.expanded::after {
      content: '-';
    }

    &.collapsed::after,
    &.expanded::after {
      position: absolute;
      left: -1em;
    }

    &.added {
      background-color: #118c4e;
      color: white;

      &.collapsed::after,
      &.expanded::after {
        color: #118c4e;
      }
    }

    &.changed {
      background-color: #ee9a00;
      color: white;

      &.collapsed::after,
      &.expanded::after {
        color: #ee9a00;
      }
    }

    &.innerChange {
      background-color: #67bcdb;
      color: white;

      &.collapsed::after,
      &.expanded::after {
        color: #67bcdb;
      }
    }

    &.removed {
      background-color: #f14d4c;
      color: white;

      &.collapsed::after,
      &.expanded::after {
        color: #f14d4c;
      }
    }
  }

  .separator,
  .value {
    &.added {
      color: #44c242;
    }

    &.changed,
    &.innerChange {
      color: #f8ba26;
    }

    &.removed {
      color: #f14d4c;
    }
  }
`;

type ApiModelAuditEntryWithId = {
  changes: ReactNode;
  id: string;
} & ApizedAuditEntry;

const generateDiffHtml = (obj: any, inheritedType?: string) => {
  const children = Object.keys(obj)
    .map((prop) => {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(prop) && prop !== '___type') {
        const localType =
          inheritedType ||
          (isNotNull(obj[prop]) ? obj[prop].___type : undefined);
        if (!localType) {
          return null;
        }

        let val;
        if (isNotNull(obj[prop]) && obj[prop].___leftValue !== undefined) {
          val = obj[prop].___leftValue;
        } else if (
          isNotNull(obj[prop]) &&
          obj[prop].___rightValue !== undefined
        ) {
          val = obj[prop].___rightValue;
        } else {
          val = obj[prop];
        }
        const valIsObj = isObject(val);
        const valueEls = [];

        if (valIsObj) {
          valueEls.push(
            generateDiffHtml(
              val,
              localType !== 'innerChange' ? localType : null,
            ),
          );
        } else {
          valueEls.push(<span className="separator"> : </span>);
          if (
            isNotNull(obj[prop]) &&
            obj[prop].___leftValue === undefined &&
            obj[prop].___rightValue === undefined
          ) {
            valueEls.push(
              <span className={`value ${localType}`}>{"" + obj[prop]}</span>,
            );
          }

          if (isNotNull(obj[prop]) && isNotNull(obj[prop].___leftValue)) {
            valueEls.push(
              <span className={`value ${localType}`}>
                  {"" + obj[prop].___leftValue}
                </span>,
            );
          }

          if (localType === 'changed') {
            valueEls.push(<span className="value"> =&gt; </span>);
          }

          if (isNotNull(obj[prop]) && isNotNull(obj[prop].___rightValue)) {
            valueEls.push(
              <span className={`value ${localType}`}>
                  {"" + obj[prop].___rightValue}
                </span>,
            );
          }
        }
        return (
          <DiffTreeNode
            isObject={valIsObj}
            label={prop}
            localType={localType}
          >
            {valueEls}
          </DiffTreeNode>
        );
      }
      return null;
    })
    .filter((el) => el !== null);

  return <ul>{children}</ul>;
};

const ApizedAuditTrail = ({
  entity,
  service,
  target,
}: {
  entity: string;
  service: Service;
  target: string;
}) => {
  const [ data, setData ] = useState<ApizedAuditEntry[]>();
  const [ loading, setLoading ] = useState<boolean>(true);

  useMemo(() => {
    setLoading(true);
    apiFor({ service, path: '/audit/[entity]/[target]' }, { entity, target })
      .list({ fields: [ '*', 'author.name', 'author.username' ] })
      .then((data) => {
        setLoading(false);
        setData(data as unknown as ApizedAuditEntry[])
      })
  }, [ service, entity, target ]);

  let entries: ApiModelAuditEntryWithId[] = [];
  if (data) {
    entries = data.map((e, idx) => {
      e.id = idx.toString();
      const previous: ApizedAuditEntry =
        idx === 0
          ? {
            action: undefined,
            author: undefined,
            payload: {},
            reason: undefined,
            target: undefined,
            timestamp: undefined,
            transactionId: undefined,
            type: undefined,
          }
          : data[idx - 1];
      const result = e as ApiModelAuditEntryWithId;
      console.log(generateDiffHtml(diff(previous.payload, e.payload)))
      result.changes = (
        <DiffContainer key={result.timestamp}>
          {generateDiffHtml(diff(previous.payload, e.payload))}
        </DiffContainer>
      );
      return result;
    }).reverse();
  }

  const userApi = apiFor(Apis.Auth.User);

  const resolveUser = ({ id }: AsyncProps<{ name: string, email: string }>) => {
    return new Promise<{ name: string, email: string }>((resolve, reject) => {
      return userApi.get({ id: id, fields: [ 'name', 'username' ] }).then((u) => {
        resolve({ name: u.name!, email: u.username! });
      }).catch(reject);
    });
  };

  const tableShape: Column<ApiModelAuditEntryWithId>[] = [
    {
      label: 'When',
      format: (entry) => {
        return entry?.timestamp;
      },
      minWidth: 180,
    },
    {
      label: 'Action',
      format: (entry) => entry?.action || 'N/A',
      minWidth: 180,
    },
    {
      label: 'User',
      format: (entry) => <Async promiseFn={resolveUser} id={entry.author}>
        {({ data }) => data ? `${data?.name} (${data.email})` :
          <div className={"shimmer"} style={{ width: '100%', height: '1.25em' }}/>}
      </Async>,
      minWidth: 180,
    },
    // {
    //   label: 'Reason',
    //   format: (entry) => entry.reason || 'N/A',
    //   minWidth: 180,
    // },
    {
      label: 'Changes',
      format: (entry) => entry.changes,
      minWidth: 180,
    },
  ];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {tableShape.map((column) => (
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
            {!loading && entries.map((model) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={model.id}
                  style={{ cursor: 'pointer' }}
                >
                  {tableShape.map((column) => {
                    return (
                      <TableCell key={`${model.id}-${column.label}`} align={column.align}
                                 style={{ minHeight: '2.6em' }}>
                        <div style={{
                          minHeight: '2.6em',
                          display: 'inline',
                          verticalAlign: 'middle'
                        }}>{column.format(model)}</div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {loading && [ ...Array(data?.length).keys() ].map((idx) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={idx}
                >
                  {tableShape.map((column) =>
                    <TableCell key={`shimmer-${idx}-${column.label}`} align={column.align}>
                      <div style={{ minHeight: '2.6em' }} className={"shimmer"}>&nbsp;</div>
                    </TableCell>)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ApizedAuditTrail;
