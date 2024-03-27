import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const [username, setUsername] = useState("");
  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token) {
        navigate("/login");
        return;
      }
      
      const { data } = await axios.post(
        "http://localhost:4000/auth",
        {},
        { withCredentials: true }
      );
      const { status, user } = data;
      setUsername(user);
      return status
        ? console.log("User verified")
        : (removeCookie("token"), navigate("/login"));
    };
    verifyCookie();
  }, [cookies, navigate, removeCookie]);
  const Logout = () => {
    removeCookie("token");
    navigate("/login");
  };
  return (
    <>
      <div className="home_page">
        <h4>
          Welcome <span>{username}</span>
        </h4>
        <button onClick={Logout}>LOGOUT</button>
      </div>
    </>
  );
};

export default Home;