import { Button, Stack } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthOauth, OauthProvider } from "../api/models/Auth";
import { useNavigate } from "react-router-dom";
import { ApizedFormProps } from "./ApizedListPage";
import FormikField from "./FormikField";

const OauthForm = (
  {
    isModal,
    onClose = () => null,
    selected
  }: ApizedFormProps<AuthOauth>) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const oauthApi = apiFor(Apis.Auth.Oauth, {});
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: selected?.id || undefined,
      name: selected?.name || '',
      slug: selected?.slug || '',
      provider: selected?.provider || '',
      clientId: selected?.clientId || '',
      clientSecret: selected?.clientSecret || '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      slug: Yup.string().required(),
      clientId: Yup.string().required(),
      clientSecret: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (selected) {
        oauthApi.update({
          id: selected.id!,
          obj: values as AuthOauth,
        }).then((u) => {
          onClose(u);
          enqueueSnackbar(`Oauth '${u.name}' updated!`, { variant: "success" });
          navigate('/oauths');
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        oauthApi.create({
          obj: values as AuthOauth,
        }).then((u) => {
          onClose(u);
          enqueueSnackbar(`Oauth '${u.name}' created!`, { variant: "success" });
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={"1em"} bottom={"1em"}>
        <FormikField required formik={formik} label={"Name"} field={"name"} type={"text"}/>
        <FormikField required formik={formik} label={"Slug"} field={"slug"} type={"text"}/>
        <FormikField
          required
          formik={formik}
          label={"Provider"}
          field={"provider"}
          type={"select"}
          options={Object.keys(OauthProvider).map((p) => (
            { label: p, value: p }
          ))}
        />
        <FormikField required formik={formik} label={"Client ID"} field={"clientId"} type={"text"}/>
        <FormikField
          required
          multiline={formik.values.provider === OauthProvider.Apple}
          formik={formik}
          label={formik.values.provider === OauthProvider.Apple ? "Private Key" : "Client Secret"}
          field={"clientSecret"}
          type={"text"}
          minRows={formik.values.provider === OauthProvider.Apple ? 3 : 1}
        />
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={() => onClose()}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{selected ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default OauthForm;