import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, Stack, TextField } from "@mui/material";
import React from "react";
import apiFor, { ApiError } from "../api/Api";
import { Apis } from "../api/Config";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { AuthUser } from "../api/models/Auth";
import FormikField from "./FormikField";
import { ApizedFormProps } from "./ApizedListPage";

const UserForm = (
  {
    isModal,
    onClose = () => null,
    selected
  }: ApizedFormProps<AuthUser>) => {
  const { enqueueSnackbar } = useSnackbar();
  const userApi = apiFor(Apis.Auth.User, {});
  const formik = useFormik({
    initialValues: {
      id: selected?.id || undefined,
      name: selected?.name || '',
      username: selected?.username || '',
      password: '',
      confirmPassword: '',
      verified: selected?.verified || false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      username: Yup.string().email().required(),
      password: isModal ? Yup.string().min(8).required() : Yup.string(),
      confirmPassword: Yup.string().test({
        exclusive: false,
        test: (_value, validationContext) => {
          const parent = validationContext.parent
          if (_value !== parent?.password) {
            return validationContext?.createError({
              message: "Passwords don't match",
              path: validationContext?.path,
            })
          }
          return true
        }
      }),
    }),
    onSubmit: (values) => {
      if (selected) {
        userApi.update({
          id: selected.id!,
          obj: {
            ...values,
            password: values.password || undefined
          },
        }).then((u) => {
          onClose(u);
          enqueueSnackbar(`User '${u.name}' updated!`, { variant: "success" });
        }).catch((e: ApiError) => {
          e.errors.map(error => enqueueSnackbar(error.message, { variant: "error" }))
        })
      } else {
        userApi.create({
          obj: values,
        }).then((u) => {
          onClose(u);
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
        <FormikField required formik={formik} label={"Name"} field={"name"} type={"text"}/>
        <FormikField required formik={formik} label={"Username"} field={"username"} type={"text"}/>
        <FormikField required={isModal} formik={formik} label={"Password"} field={"password"} type={"password"}/>
        <FormikField required={isModal} formik={formik} label={"Confirm Password"} field={"confirmPassword"} type={"password"}/>
        {!isModal &&
          <>
            <FormControl fullWidth required component="fieldset" margin="normal">
              <FormGroup row aria-label="position">
                <FormControlLabel
                  control={
                    <Checkbox
                      // disabled={loading}
                      checked={formik.values.verified}
                      color="secondary"
                      name="verified"
                      onChange={formik.handleChange}
                    />
                  }
                  label="Verified"
                  labelPlacement="start"
                  value="No"
                />
              </FormGroup>
            </FormControl>
            <TextField
              disabled
              fullWidth
              label="Email verification code"
              value={selected?.emailVerificationCode}
            />
            <TextField
              disabled
              fullWidth
              label="Password reset code"
              value={selected?.passwordResetCode}
            />
          </>
        }
        <Stack direction={"row"} spacing={"1em"} justifyContent={"right"}>
          {isModal && (<Button variant={"outlined"} onClick={() => onClose()}>Cancel</Button>)}
          <Button variant={"contained"} onClick={formik.submitForm}>{selected ? 'Update' : 'Create'}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default UserForm;