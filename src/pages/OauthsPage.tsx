import React, { useState } from 'react';
import ApizedListPage from "../components/ApizedListPage";
import { AuthOauth } from "../api/models/Auth";
import { Apis } from "../api/Config";
import { Box, Breadcrumbs, Dialog, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchEntry } from "../components/search/Types";
import { Operation } from "../api/Search";
import OauthForm from "../components/OauthForm";
import apiFor, { ApiError } from "../api/Api";
import { Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";

const OauthsPage = () => {
  const snackbar = useSnackbar();
  const oauthApi = apiFor(Apis.Auth.Oauth, {});
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
          definition: Apis.Auth.Oauth
        },
      }
    },
    {
      id: 'slug',
      label: "Slug",
      operations: [
        { label: "contains", value: Operation.Like },
        { label: "is", value: Operation.Equals },
        { label: "is not", value: Operation.NotEquals },
      ],
      value: 'slug',
      values: {
        label: 'slug',
        value: 'slug',
        query: {
          context: {},
          definition: Apis.Auth.Oauth
        },
      }

    }
  ];

  return (
    <Stack spacing={"1em"}>
      <ApizedListPage<AuthOauth>
        columns={[
          { label: 'Name', minWidth: 170, format: (value) => value.name },
          { label: 'Slug', minWidth: 100, format: (value) => value.slug },
          {
            label: '',
            minWidth: 10,
            format: (role) => <IconButton
              sx={{ padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                oauthApi.remove({ id: role.id! })
                  .then(() => {
                    snackbar.enqueueSnackbar(`Oauth ${role.name} deleted.`, { variant: "success" })
                    setRefreshTrigger(new Date().getTime());
                  })
                  .catch((e: ApiError) => {
                    e.errors.map((error) => snackbar.enqueueSnackbar(error.message, { variant: "error" }))
                  });
              }}
            >
              <Delete/>
            </IconButton>
          }
        ]}
        fields={[ '*' ]}
        context={{}}
        form={OauthForm}
        query={Apis.Auth.Oauth}
        searchConfig={searchConfig}
        refetchTrigger={refetchTriger}
      />
    </Stack>
  );
};

export default OauthsPage;
