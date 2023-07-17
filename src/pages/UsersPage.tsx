import React, { useState } from 'react';
import ApizedListPage from "../components/ApizedListPage";
import { AuthRole, AuthUser } from "../api/models/Auth";
import { Apis } from "../api/Config";
import { Box, Breadcrumbs, Dialog, DialogTitle, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchEntry } from "../components/search/Types";
import { Operation } from "../api/Search";
import UserForm from "../components/UserForm";

const UsersPage = () => {
  const navigate = useNavigate();

  const [ open, setOpen ] = useState(false);

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
          definition: Apis.Auth.User
        },
      }
    },
    {
      label: "Username",
      operations: [
        { label: "contains", value: Operation.Like },
        { label: "is", value: Operation.Equals },
        { label: "is not", value: Operation.NotEquals },
      ],
      value: 'username',
      values: {
        label: 'username',
        value: 'username',
        query: {
          context: {},
          definition: Apis.Auth.User
        },
      }

    },
    {
      label: "Role",
      operations: [
        { label: "is", value: Operation.Equals },
        { label: "is not", value: Operation.NotEquals },
      ],
      value: 'roles.id',
      values: {
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
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>
      <ApizedListPage<AuthUser>
        columns={[
          { label: 'Username', minWidth: 170, format: (value) => value.username },
          { label: 'Name', minWidth: 100, format: (value) => value.name },
          {
            label: 'Roles',
            minWidth: 100,
            format: (value) => (value.roles as AuthRole[])?.map(r => r.name)?.join(', ')
          },
        ]}
        fields={[ 'name', 'username', 'roles.name' ]}
        context={{}}
        query={Apis.Auth.User}
        onCreate={() => setOpen(true)}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        searchConfig={searchConfig}
      />
      <Dialog
        fullWidth
        open={open}
      >
        <DialogTitle>Create User</DialogTitle>
        <Box sx={{ padding: '1em' }}>
          <UserForm isModal={true} onClose={() => setOpen(false)}/>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default UsersPage;
