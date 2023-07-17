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

const App = () => {
  return (
    <UserContextProvider>
      <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: "bottom" }}>
        <Container>
          <Stack spacing={"1em"}>
            <HashRouter>
              <MainNavigation routes={[
                { path: "/users", description: "Users" },
                { path: "/roles", description: "Roles" },
              ]}/>
              <Box>
                <Routes>
                  <Route path={"/users"} element={<UsersPage/>}/>
                  <Route path={"/users/:id"} element={<UserPage/>}/>
                  <Route path={"/roles"} element={<RolesPage/>}/>
                  <Route path={"/roles/:id"} element={<RolePage/>}/>
                  <Route path="*" element={<Navigate to="/users" replace/>}/>
                </Routes>
              </Box>
            </HashRouter>
          </Stack>
        </Container>
      </SnackbarProvider>
    </UserContextProvider>
  );
}

export default App;
