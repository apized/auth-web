import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthOauth, OauthProvider } from "../api/models/Auth";
import { useNavigate } from "react-router-dom";

const OauthForm = (
  {
    isModal,
    onClose = () => null,
    oauth
  }: {
    isModal?: boolean;
    onClose?: () => void;
    oauth?: AuthOauth;
  }
) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const oauthApi = apiFor(Apis.Auth.Oauth, {});
  const formik = useFormik({
    initialValues: {
      id: oauth?.id || undefined,
      name: oauth?.name || '',
      slug: oauth?.slug || '',
      provider: oauth?.provider || OauthProvider.Google,
      clientId: oauth?.clientId || '',
      clientSecret: oauth?.clientSecret,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      slug: Yup.string().required(),
      clientId: Yup.string().required(),
      clientSecret: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (oauth) {
        oauthApi.update({
          id: oauth.id!,
          obj: values,
        }).then((u) => {
          onClose();
          enqueueSnackbar(`Oauth '${u.name}' updated!`, { variant: "success" });
          navigate('/oauths');
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        oauthApi.create({
          obj: values,
        }).then((u) => {
          onClose();
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
        <TextField
          fullWidth
          required
          label="Name"
          name="name"
          type="text"
          autoComplete={oauth ? "none" : "name"}
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          required
          label="Slug"
          name="slug"
          type="text"
          value={formik.values.slug}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.slug && Boolean(formik.errors.slug)}
          helperText={formik.touched.slug && formik.errors.slug}
        />
        <FormControl>
          <InputLabel id="provider">Provider</InputLabel>
          <Select
            labelId="provider"
            label="Provider"
            name="provider"
            value={formik.values.provider}
            onChange={formik.handleChange}
            MenuProps={{ style: { zIndex: 9999999 } }}
          >
            {Object.keys(OauthProvider).map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          required
          label="Client ID"
          name="clientId"
          type="text"
          value={formik.values.clientId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.clientId && Boolean(formik.errors.clientId)}
          helperText={formik.touched.clientId && formik.errors.clientId}
        />
        <TextField
          fullWidth
          required
          label="Client Secret"
          name="clientSecret"
          type="text"
          value={formik.values.clientSecret}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.clientSecret && Boolean(formik.errors.clientSecret)}
          helperText={formik.touched.clientSecret && formik.errors.clientSecret}
        />
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={onClose}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{oauth ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default OauthForm;