import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ContextApi = createContext();

export const ContextProvider = ({ children }) => {
  // Retrieve token from localStorage
  const getTokenFromStorage = () => localStorage.getItem("JWT_TOKEN") || null;
  const getIsAdminFromStorage = () => JSON.parse(localStorage.getItem("IS_ADMIN")) || false;

  const [token, setToken] = useState(getTokenFromStorage);
  const [currentUser, setCurrentUser] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(true);
  const [isAdmin, setIsAdmin] = useState(getIsAdminFromStorage);
  const [userEmail, setUserEmail] = useState(null); // New state for user email

  // Function to fetch the current user details
  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/auth/user`); // Fetch user data from API
      const { email, roles } = data;

      setUserEmail(email); // Set user's email in state
      setCurrentUser(data); // Update currentUser state

      // Set admin status based on roles
      if (roles.includes("ROLE_ADMIN")) {
        localStorage.setItem("IS_ADMIN", JSON.stringify(true));
        setIsAdmin(true);
      } else {
        localStorage.removeItem("IS_ADMIN");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error fetching current user", error);
      toast.error("Error fetching current user");
    }
  };

  // Update token in both state and localStorage
  const handleTokenChange = (newToken) => {
    if (newToken) {
      localStorage.setItem("JWT_TOKEN", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("JWT_TOKEN");
      setToken(null);
    }
  };

  // Effect to fetch user data when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  return (
    <ContextApi.Provider
      value={{
        token,
        setToken: handleTokenChange, // Use handleTokenChange to update token
        currentUser,
        setCurrentUser,
        openSidebar,
        setOpenSidebar,
        isAdmin,
        setIsAdmin,
        userEmail, // Provide userEmail in context
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};

// Custom hook to access context
export const useMyContext = () => useContext(ContextApi);
