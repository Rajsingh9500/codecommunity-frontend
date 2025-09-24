import axios from "axios";

const api = axios.create({
  baseURL: "/api", // thanks to proxy, this points to http://localhost:5000/api
  withCredentials: true,
});

export default api;
