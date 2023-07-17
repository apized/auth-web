import { Button, Stack, TextField } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthRole } from "../api/models/Auth";

const RoleForm = (
  {
    isModal,
    onClose = () => null,
    role
  }: {
    isModal?: boolean;
    onClose?: () => void;
    role?: AuthRole;
  }
) => {
  const { enqueueSnackbar } = useSnackbar();
  const roleApi = apiFor(Apis.Auth.Role, {});
  const formik = useFormik({
    initialValues: {
      id: role?.id || undefined,
      description: role?.description,
      name: role?.name,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required().max(255),
      description: Yup.string().required().max(1024),
    }),
    onSubmit: (values) => {
      if (role) {
        roleApi.update({
          id: role.id!,
          obj: values,
        }).then((u) => {
          onClose();
          enqueueSnackbar(`Role '${u.name}' updated!`, { variant: "success" });
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        roleApi.create({
          obj: values,
        }).then((u) => {
          onClose();
          enqueueSnackbar(`Role '${u.name}' created!`, { variant: "success" });
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
          label="Name"
          name="name"
          type="text"
          autoComplete={"none"}
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          name="description"
          type="text"
          autoComplete={"none"}
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={onClose}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{role ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default RoleForm;