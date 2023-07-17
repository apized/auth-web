import { Button, Stack, TextField } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthUser } from "../api/models/Auth";

const UserForm = (
  {
    isModal,
    onClose = () => null,
    user
  }: {
    isModal?: boolean;
    onClose?: () => void;
    user?: AuthUser;
  }
) => {
  const { enqueueSnackbar } = useSnackbar();
  const userApi = apiFor(Apis.Auth.User, {});
  const formik = useFormik({
    initialValues: {
      id: user?.id || undefined,
      name: user?.name || '',
      username: user?.username || '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      username: Yup.string().email().required(),
      password: Yup.string().required(),
      confirmPassword: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (user) {
        userApi.update({
          id: user.id!,
          obj: values,
        }).then((u) => {
          onClose();
          enqueueSnackbar(`User '${u.name}' updated!`, { variant: "success" });
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        userApi.create({
          obj: values,
        }).then((u) => {
          onClose();
          enqueueSnackbar(`User '${u.name}' created!`, { variant: "success" });
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
          autoComplete={user ? "none" : "name"}
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          type="text"
          autoComplete={user ? "none" : "username"}
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          autoComplete={"new-password"}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete={"new-password"}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={onClose}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{user ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default UserForm;