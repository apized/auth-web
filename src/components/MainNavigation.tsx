/* eslint-disable react-hooks/exhaustive-deps */
import Logo from '../atoms/Logo';
import React, { useEffect, useState } from 'react';
import { useAuthContext } from "../context/UserContext";
import { useEventBus } from "../lib/bus/EventBus";
import LoginModal from "./LoginModal";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import { Apis } from "../api/Config";
import apiFor from "../api/Api";
import md5 from "md5";
import { useNavigate } from "react-router-dom";

type Route = {
  children?: Route[];
  description: string;
  path: string;
  permission?: string;
};

const MainNavigation = ({ routes }: { routes: Route[] }) => {
  const eventBus = useEventBus();
  const user = useAuthContext();
  const [ isOpen, setOpen ] = useState(false);
  const logout = apiFor(Apis.Auth.Login, {}).remove;
  const navigate = useNavigate();

  useEffect(() => eventBus.effect('login-requested', () => setOpen(true)), [ eventBus ]);

  useEffect(() => eventBus.effect('login-success', () => setOpen(false)), [ eventBus ]);

  useEffect(() => eventBus.effect('logout-requested', () => {
    logout({ id: '' }).then(() => eventBus.dispatch('logout-success'));
  }), [ eventBus, logout ]);

  useEffect(() => eventBus.effect('logout-success', () => setOpen(true)), [ eventBus ]);

  const [ anchorElUser, setAnchorElUser ] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar position="static">
        <Container>
          <Toolbar disableGutters>
            <Box sx={{ display: 'flex', mr: 1 }}>
              <Logo/>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {routes
                .filter(
                  (route: Route) => !route.permission || user?.isAllowed(route.permission),
                )
                .map((route: Route) => {
                  return (
                    <Button key={route.path} sx={{ my: 2, color: 'white', display: 'block' }} onClick={() => {
                      navigate(route.path);
                    }}>
                      {route.description}
                    </Button>
                  );
                })
              }
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.name} src={`https://www.gravatar.com/avatar/${md5(user?.username || '')}?d=404`}/>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  navigate(`/users/${user?.id}`);
                }}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography textAlign="center" onClick={() => {
                    handleCloseUserMenu();
                    eventBus.dispatch('logout-requested');
                  }}>Logout</Typography>
                </MenuItem>

              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <LoginModal
        open={isOpen}
        onClose={() => {
          setOpen(false);
          return eventBus.dispatch('login-success');
        }}
      />
    </>
  );
};

export default MainNavigation;
