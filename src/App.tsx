import React from 'react';
import './App.css';
import UserContextProvider from "./context/UserContextProvider";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import UserPage from "./pages/UserPage";
import MainNavigation from "./components/MainNavigation";
import RolePage from "./pages/RolePage";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box, Container, Stack } from "@mui/material";
import { SnackbarProvider } from "notistack";
import OauthsPage from "./pages/OauthsPage";
import SocialLogin from "./components/SocialLogin";

declare global {
  interface Window {
    ApplePaySession: any
    _env_: { AUTH_SERVER_URL: string }
  }

  interface Array<T> {
    unique(key: (t: T) => string): T[];
  }
}

if (Array.prototype.unique === undefined) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'unique', {
    value: function (key: (t: unknown) => string) {
      const seen: { [key: string]: unknown } = {};
      this.forEach((item: unknown) => {
        seen[key(item)] = item;
      });
      return Object.values(seen);
    }
  });
}

const App = () => {
  const isModal = window.location.pathname.startsWith('/auth/login/');
  return isModal
    ? <SocialLogin/>
    : <UserContextProvider>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: "bottom" }}>
        <Stack spacing={"1em"}>
          <HashRouter>
            <MainNavigation routes={[
              {
                path: "/users",
                description: "Users",
                children: [ { path: "/a", description: "A" }, { path: "/b", description: "B" } ]
              },
              { path: "/roles", description: "Roles" },
              { path: "/oauths", description: "Oauth" },
            ]}/>
            <Box>
              <Container>
                <Routes>
                  <Route path={"/auth/login/:slug"} element={<SocialLogin/>}/>
                  <Route path={"/users"} element={<UsersPage/>}/>
                  <Route path={"/users/:id"} element={<UserPage/>}/>
                  <Route path={"/roles"} element={<RolesPage/>}/>
                  <Route path={"/roles/:id"} element={<RolePage/>}/>
                  <Route path={"/oauths"} element={<OauthsPage/>}/>
                  <Route path="*" element={<Navigate to="/users" replace/>}/>
                </Routes>
              </Container>
            </Box>
          </HashRouter>
        </Stack>
      </SnackbarProvider>
    </UserContextProvider>;
}

export default App;
