import axios from "axios";

export const signIn = async (email, password) => {
  const response = await axios.post("/api/signin", { email, password });
  const { token } = response.data;
  document.cookie = `authToken=${token}; path=/;`;
  return token;
};

export const signUp = async (name, email, password) => {
  const response = await axios.post("/api/signup", { name, email, password });
  return response.data;
};

export const signOut = () => {
  document.cookie =
    "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};
