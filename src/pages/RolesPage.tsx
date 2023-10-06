import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Breadcrumbs, Dialog, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
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

  const [ open, setOpen ] = useState(false);

  const roleApi = apiFor(Apis.Auth.Role, {});

  const searchConfig: SearchEntry[] = [
    {
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
      <Breadcrumbs aria-label="breadcrumb">
        <Typography color="text.primary">Roles</Typography>
      </Breadcrumbs>
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
                    //todo setRefresh(new Date().getTime())
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
        onCreate={() => setOpen(true)}
        onRowClick={(user) => navigate(`/roles/${user.id}`)}
        searchConfig={searchConfig}/>
      <Dialog
        fullWidth
        open={open}
      >
        <DialogTitle>Create User</DialogTitle>
        <Box sx={{ padding: '1em' }}>
          <RoleForm isModal={true} onClose={() => setOpen(false)}/>
        </Box>
      </Dialog>
    </Stack>);
};

export default RolesPage;
