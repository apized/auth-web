import React from 'react';
import { useNavigate } from "react-router-dom";
import { IconButton, Stack } from "@mui/material";
import ApizedListPage from "../components/ApizedListPage";
import { AuthRole } from "../api/models/Auth";
import { Apis } from "../api/Config";
import { SearchEntry } from "../components/search/Types";
import { Operation } from "../api/Search";
import RoleForm from "../components/RoleForm";
import { Delete } from "@mui/icons-material";
import apiFor, { ApiError } from "../api/Api";
import { useSnackbar } from "notistack";

const RolesPage = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const roleApi = apiFor(Apis.Auth.Role, {});
  const [ refetchTriger, setRefreshTrigger ] = React.useState(new Date().getTime());

  const searchConfig: SearchEntry[] = [
    {
      id: 'name',
      label: "Name",
      operations: [
        { label: "contains", value: Operation.Like },
        { label: "is", value: Operation.Equals },
        { label: "is not", value: Operation.NotEquals },
      ],
      value: 'name',
      values: {
        label: 'name',
        value: 'name',
        query: {
          context: {},
          definition: Apis.Auth.Role
        },
      }
    }
  ];

  return (
    <Stack spacing={"1em"}>
      <ApizedListPage<AuthRole>
        columns={[
          { label: 'Name', minWidth: 170, format: (value) => value.name },
          { label: 'Description', minWidth: 100, format: (value) => value.description },
          { label: 'Permissions', minWidth: 100, format: (value) => value.permissions?.join(', ') },
          {
            label: '',
            minWidth: 10,
            format: (role) => <IconButton
              onClick={(e) => {
                e.stopPropagation();
                roleApi.remove({ id: role.id! })
                  .then(() => {
                    snackbar.enqueueSnackbar(`Role ${role.name} deleted.`, { variant: "success" })
                    setRefreshTrigger(new Date().getTime())
                  })
                  .catch((e: ApiError) => {
                    e.errors.map((error) => snackbar.enqueueSnackbar(error.message, { variant: "error" }))
                  });
              }}
            >
              <Delete/>
            </IconButton>
          },
        ]}
        context={{}}
        query={Apis.Auth.Role}
        form={RoleForm}
        onRowClick={(user) => navigate(`/roles/${user.id}`)}
        searchConfig={searchConfig}
        refetchTrigger={refetchTriger}
      />
    </Stack>);
};

export default RolesPage;
