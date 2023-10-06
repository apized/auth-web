import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { Box, Button, CircularProgress, Dialog, ModalProps, Stack, Tab, Tabs, TextField } from "@mui/material";
import apiFor, { serviceRegistry } from "../api/Api";
import { Apis } from "../api/Config";
import { useEventBus } from "../lib/bus/EventBus";
import { useApiList } from "../api/ApiHooks";
import { OauthProvider } from "../api/models/Auth";

export type ApizedModalProps = Pick<ModalProps, 'open' | 'onClose'>;

const LoginModal = ({
  open,
  onClose,
}: ApizedModalProps) => {
  const eventBus = useEventBus();
  const [ value, setValue ] = React.useState(0);

  const { data: oauthPage, loading } = useApiList(Apis.Auth.Oauth, {}, {});
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
      {
        loading
          ? <CircularProgress/>
          : <>
            <Tabs variant={"fullWidth"} value={value} onChange={(_, v) => setValue(v)}>
              <Tab label="Social"/>
              <Tab label="Email / Password"/>
            </Tabs>
            <Box sx={{ width: "20em" }}>
              {value === 0
                ? <Stack padding={"1em"} spacing={"1em"}>
                  {oauthPage.content.map(o => (
                    <Button
                      key={o.id}
                      variant={"contained"}
                      onClick={() => {
                        const redirect = o.provider === OauthProvider.Apple
                          ? `${serviceRegistry.auth}/tokens/oauth/apple`
                          : `https://${window.location.hostname}/auth/login/${o.slug}`
                        if (o.provider === OauthProvider.Apple && window.ApplePaySession) {
                          window.location.href = `${o.loginUrl}&redirect_uri=${redirect}`;
                        } else {
                          const win = window.open(
                            `${o.loginUrl}&redirect_uri=${redirect}`,
                            '_system',
                            'resizable=yes; status=no; scroll=no; help=no; center=yes; width=800; height=600; menubar=no; directories=no; location=no; modal=yes;',
                          );
                          const timer = setInterval(() => {
                            if (!win || win.closed) {
                              clearInterval(timer);
                              eventBus.dispatch("login-success");
                            }
                          }, 1000);
                        }
                      }}
                    >
                      {o.name}
                    </Button>
                  ))}
                </Stack>
                : <Stack padding={"1em"}>
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
                        <Button variant={"contained"} disabled={!formik.isValid} type="submit" sx={{fontSize:"0.75em"}}>
                          Login
                        </Button>
                        <Button variant={"outlined"} disabled={!formik.isValid} sx={{fontSize:"0.75em"}}>Register</Button>
                        <div style={{ textAlign: 'right' }}>
                          <Button variant={"text"} style={{ fontSize: '0.5em' }} type="button">
                            forgot password?
                          </Button>
                        </div>
                      </Stack>
                    </Stack>
                  </form>
                </Stack>
              }
            </Box>
          </>
      }
    </Dialog>
  );
};

export default LoginModal;
