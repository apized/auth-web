import { createContext, useContext } from 'react';

import { User } from './User';

const UserContext = createContext<User | undefined>(undefined);

export const useAuthContext = () => {
  return useContext(UserContext);
};

export default UserContext;
