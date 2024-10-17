import React from 'react';
import { Box, Breadcrumbs, Button, Link, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useApiGet } from "../api/ApiHooks";
import { AuthRole } from "../api/models/Auth";
import { Apis } from "../api/Config";
import BorderedSection from "../atoms/BorderedSection";
import { GreenBadge } from "../atoms/Badge";
import { serviceRegistry } from "../api/Api";
import RoleForm from "../components/RoleForm";

const RolePage = () => {
  const { id } = useParams<any>();

  const { data: role, loading, refetch } = useApiGet<AuthRole>(Apis.Auth.Role, {}, { id })

  const grantPermission = () => {
    const permission = window.prompt('Permission?');
    if (permission) {
      fetch(`${serviceRegistry.auth}/roles/${role.id!}/permissions/${permission}`, {
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
      fetch(`${serviceRegistry.auth}/roles/${role.id!}/permissions/${permission}`, {
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
        <Link underline="hover" color="inherit" href="#/roles">
          Roles
        </Link>
        <Typography color="text.primary">Role <b>{role?.name}</b></Typography>
      </Breadcrumbs>
      {!loading && role && (
        <>
          <BorderedSection title={"Details"}>
            <RoleForm selected={role}/>
          </BorderedSection>
          <BorderedSection title={"Permissions"}>
            <Stack direction={"row"} flexWrap={"wrap"}>
              {role?.permissions?.map((p) => (
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
        </>
      )}
    </Stack>
  );
};

export default RolePage;
