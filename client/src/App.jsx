import axios from "axios";
import {UserContextProvider} from "./UserContext";
import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = 'https://chat3-ubif.onrender.com';
  axios.defaults.withCredentials = true;
  console.log("in app");
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
