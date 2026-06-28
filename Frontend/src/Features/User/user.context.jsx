import { createContext, useContext, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userLoading, setUserLoading] = useState(false);

  return (
    <UserContext.Provider value={{ userLoading, setUserLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export default UserProvider;