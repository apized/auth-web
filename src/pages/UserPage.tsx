import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Box, Breadcrumbs, Button, Link, Stack, Typography } from "@mui/material";
import { useApiGet, useApiList } from "../api/ApiHooks";
import { AuthRole, AuthUser } from "../api/models/Auth";
import { Apis } from "../api/Config";
import UserForm from "../components/UserForm";
import { GreenBadge, GreyBadge } from "../atoms/Badge";
import BorderedSection from "../atoms/BorderedSection";
import { IosShare } from "@mui/icons-material";
import apiFor, { ApiError, serviceRegistry } from "../api/Api";
import { useSnackbar } from "notistack";

const UserPage = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar()
  const { id } = useParams<any>();
  const { data: user, loading: loadingUser, refetch } = useApiGet<AuthUser>(
    Apis.Auth.User,
    {},
    {
      id,
    }
  )
  const { data: roles, loading: loadingRoles } = useApiList<AuthRole>(
    Apis.Auth.Role,
    {},
    {
      pageSize: 999,
      fields: [ 'name' ]
    }
  )
  const loading = loadingUser || loadingRoles;
  const userApi = apiFor(Apis.Auth.User);
  const expiringTokenApi = apiFor(Apis.Auth.ExpiringToken, { user: { id } });
  const nonExpiringtokenApi = apiFor(Apis.Auth.NonExpiringToken, { user: { id } });

  const addRole = (role: AuthRole) => {
    const roles = (user.roles! as string[]).concat(role.id!)
    userApi.update({
      id: user.id!,
      obj: { roles }
    })
      .then(() => {
        snackbar.enqueueSnackbar(`Role '${role.name}' added`, { variant: "success" })
        refetch();
      })
      .catch((e: ApiError) => {
        e.errors.map((error) => snackbar.enqueueSnackbar(error.message, { variant: "error" }))
      })
  };

  const removeRole = (role: AuthRole) => {
    const roles = (user.roles! as string[]).concat([])
    roles.splice(roles.indexOf(role.id!), 1);

    userApi.update({
      id: user.id!,
      obj: { roles }
    })
      .then(() => {
        snackbar.enqueueSnackbar(`Role '${role.name}' removed`, { variant: "success" })
        refetch();
      })
      .catch((e: ApiError) => {
        e.errors.map((error) => snackbar.enqueueSnackbar(error.message, { variant: "error" }))
      })
  };

  const grantPermission = () => {
    const permission = window.prompt('Permission?');
    if (permission) {
      fetch(`${serviceRegistry.auth}/users/${user.id!}/permissions/${permission}`, {
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      }).then(refetch)
    }
  };

  const revokePermission = () => {
    const permission = window.prompt('Permission?');
    if (permission) {
      fetch(`${serviceRegistry.auth}/users/${user.id!}/permissions/${permission}`, {
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        method: 'DELETE',
      }).then(refetch)
    }
  };

  return (
    <Stack spacing={"1em"}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="#/users">
          Users
        </Link>
        <Typography color="text.primary">User <b>{user?.username}</b></Typography>
      </Breadcrumbs>
      {!loading && user && (
        <>
          <BorderedSection title={"Details"}>
            <UserForm user={user}/>
          </BorderedSection>
          <BorderedSection title={"Permissions"}>
            <Stack direction={"row"} flexWrap={"wrap"}>
              {user?.permissions?.map((p) => (
                <Box key={p} margin={"0.25em"}>
                  <GreenBadge>{p}</GreenBadge>
                </Box>
              ))}
            </Stack>
            <Stack direction={"row"} spacing={"1em"} justifyContent={"flex-end"}>
              <Button variant={"outlined"} onClick={grantPermission}>Grant</Button>
              <Button variant={"outlined"} onClick={revokePermission}>Revoke</Button>
            </Stack>
          </BorderedSection>
          <BorderedSection title={"Roles"}>
            <Stack direction={"row"} flexWrap={"wrap"}>
              {roles && roles.content?.map((r) => (
                <Box key={r.id} margin={"0.25em"}>
                  {(user?.roles as string[] || []).indexOf(r.id || '') === -1
                    ? (
                      <GreyBadge
                        style={{ cursor: 'pointer' }}
                        onClick={() => addRole(r)}
                      >
                        {r.name}
                        &nbsp;
                        <IosShare
                          style={{ fontSize: "1.5em" }}
                          color={"primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/roles/${r.id}`);
                          }}
                        />
                      </GreyBadge>
                    )
                    : (
                      <GreenBadge
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeRole(r)}
                      >
                        {r.name}
                        &nbsp;
                        <IosShare
                          style={{ fontSize: "1.5em" }}
                          color={"primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/roles/${r.id}`);
                          }}
                        />
                      </GreenBadge>
                    )
                  }
                </Box>
              ))}
            </Stack>
          </BorderedSection>
          <BorderedSection title={"Generate Tokens"}>
            <Stack direction={"row"} spacing={"1em"} justifyContent={"center"}>
              <Button variant={"contained"} onClick={() =>
                expiringTokenApi.create({ obj: {} }).then((token) => {
                  window.prompt("Token", token.jwt);
                })
              }>Expiring</Button>
              <Button variant={"contained"} onClick={() =>
                nonExpiringtokenApi.create({ obj: {}, }).then((token) => {
                  window.prompt("Token", token.jwt);
                })
              }>Non-Expiring</Button>
            </Stack>
          </BorderedSection>
        </>
      )}
    </Stack>
  );
};

export default UserPage;
