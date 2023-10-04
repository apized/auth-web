import React from 'react';
import { useParams } from "react-router-dom";
import { Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { useApiGet } from "../api/ApiHooks";
import { AuthOauth } from "../api/models/Auth";
import { Apis } from "../api/Config";
import BorderedSection from "../atoms/BorderedSection";
import OauthForm from "../components/OauthForm";

const OauthPage = () => {
  const { id } = useParams<any>();
  const { data: oauth, loading } = useApiGet<AuthOauth>(
    Apis.Auth.Oauth,
    {},
    {
      id,
    }
  )

  return (
    <Stack spacing={"1em"}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="#/oauths">
          Oauths
        </Link>
        <Typography color="text.primary">Oauth <b>{oauth?.name}</b></Typography>
      </Breadcrumbs>
      {!loading && oauth && (
        <>
          <BorderedSection title={"Details"}>
            <OauthForm oauth={oauth}/>
          </BorderedSection>
        </>
      )}
    </Stack>
  );
};

export default OauthPage;
