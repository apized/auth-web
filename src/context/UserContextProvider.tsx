import React, { useEffect, useMemo } from 'react';

import UserContext from './UserContext';
import { useApiGet } from "../api/ApiHooks";
import { Apis } from "../api/Config";
import { User } from "./User";
import { useEventBus } from "../lib/bus/EventBus";

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const eventBus = useEventBus();
  const {
    data: user,
    refetch
  } = useApiGet(Apis.Auth.Me, {}, { fields: [ 'name', 'username', 'permissions', 'roles.permissions' ] })

  const ProviderValues = useMemo(() => {
    if (user?.username?.startsWith('anonymous@')) {
      eventBus.dispatch('login-requested');
    }
    return user?.username?.startsWith('anonymous@') ? new User(user) : undefined;
  }, [ eventBus, user ]);

  useEffect(() => {
    return eventBus.effect('user-refetch', () => {
      try {
        refetch()
      } catch {
        eventBus.dispatch('login-requested')
      }
    });
  }, [ eventBus, refetch ]);

  useEffect(() => {
    return eventBus.effect('logout-success', refetch);
  }, [ eventBus, refetch ]);

  useEffect(() => {
    return eventBus.effect('login-success', () => {
      try {
        refetch()
      } catch {
        eventBus.dispatch('login-requested')
      }
    });
  }, [ eventBus, refetch ]);

  return (
    <UserContext.Provider value={ProviderValues}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
