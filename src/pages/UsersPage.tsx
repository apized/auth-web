import React from 'react';
import ApizedListPage from "../components/ApizedListPage";
import { AuthRole, AuthUser } from "../api/models/Auth";
import { Apis } from "../api/Config";
import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchEntry } from "../components/search/Types";
import { Operation } from "../api/Search";
import UserForm from "../components/UserForm";
import apiFor from "../api/Api";

const UsersPage = () => {
  const navigate = useNavigate();
  const tokenApi = apiFor(Apis.Auth.Me);
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
          definition: Apis.Auth.User
        },
      }
    },
    {
      id: 'username',
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
      id: 'role',
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
      <ApizedListPage<AuthUser>
        actions={[
          {
            display: 'Redeem', onClick: () => {
              let jwt = window.prompt("JWT token", "")!;
              tokenApi.get({ id: jwt }).then((u) => {
                window.alert(JSON.stringify(u, null, 2));
              });
            }
          }
        ]}
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
        form={UserForm}
        context={{}}
        query={Apis.Auth.User}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        searchConfig={searchConfig}
      />
    </Stack>
  );
};

export default UsersPage;
