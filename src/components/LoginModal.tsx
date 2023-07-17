import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { Button, Dialog, ModalProps, Stack, TextField } from "@mui/material";
import apiFor from "../api/Api";
import { Apis } from "../api/Config";
import { useEventBus } from "../lib/bus/EventBus";

export type ApizedModalProps = Pick<ModalProps, 'open' | 'onClose'>;

const LoginModal = ({
  open,
  onClose,
}: ApizedModalProps) => {
  const eventBus = useEventBus();
  const login = apiFor(Apis.Auth.Login, {}).create;
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string().required(),
      username: Yup.string().email().required(),
    }),
    onSubmit: (values) => {
      login({
        obj: values
      })
        .then((r) => eventBus.dispatch('login-success'))
        .catch(() => {
        })
    },
  });

  return (
    <Dialog key="login" open={open} onClose={onClose}>
      <Stack padding={"1em"}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={"1em"} bottom={"1em"}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              type="text"
              autoComplete={"username"}
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
              autoComplete={"current-password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Stack direction="row"
                   justifyContent="left"
                   alignItems="baseline"
                   spacing={2}>
              <Button variant={"contained"} disabled={!formik.isValid} type="submit">
                Sign in
              </Button>
              <Button variant={"outlined"} disabled={!formik.isValid}>Sign up</Button>
              <div style={{ textAlign: 'right' }}>
                <Button variant={"text"} style={{ fontSize: '0.5em' }} type="button">
                  forgot password?
                </Button>
              </div>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Dialog>
  );
};

export default LoginModal;
