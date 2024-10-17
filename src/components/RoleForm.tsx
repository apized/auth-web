import { Button, Stack } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthRole } from "../api/models/Auth";
import FormikField from "./FormikField";
import { ApizedFormProps } from "./ApizedListPage";

const RoleForm = (
  {
    isModal,
    onClose = () => null,
    selected
  }: ApizedFormProps<AuthRole>
) => {
  const { enqueueSnackbar } = useSnackbar();
  const roleApi = apiFor(Apis.Auth.Role, {});
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: selected?.id || undefined,
      name: selected?.name,
      description: selected?.description,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required().min(2).max(255),
      description: Yup.string().required().min(2).max(1024),
    }),
    onSubmit: (values) => {
      if (selected) {
        roleApi.update({
          id: selected.id!,
          obj: values,
        }).then((u) => {
          onClose(u);
          enqueueSnackbar(`Role '${u.name}' updated!`, { variant: "success" });
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        roleApi.create({
          obj: values,
        }).then((u) => {
          onClose(u);
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
        <FormikField formik={formik} label={"Name"} field={"name"} type={"text"}/>
        <FormikField required multiline formik={formik} label={"Description"} field={"description"} type={"text"}/>
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={() => onClose()}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{selected ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default RoleForm;