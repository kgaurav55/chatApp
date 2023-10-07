import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  console.log("registerloginrerendered");
  const[x,setx]=useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  const [registrationError, setRegistrationError] = useState(null);
  async function handleSubmit(ev) {
    ev.preventDefault();
    try {
      const url = isLoginOrRegister === 'register' ? 'register' : 'login';
      const { data } = await axios.post(url, { username, password });
      console.log("inside login");
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      // the response is comming as in the object of error 
      if (error.response && error.response.status === 400) {
        setRegistrationError('Username already exists. Please choose a different username.');
      } else {
        console.error('Error during registration:', error);
        setRegistrationError('An error occurred during registration. Please try again later.');
      }
    }
  }
   
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
      {registrationError && ( // Display registration error if it exists
        <div className="text-red-500 mb-2">{registrationError}</div>
      )}
        <input value={username}
               onChange={ev => setUsername(ev.target.value)}
               type="text" placeholder="username"
               className="block w-full rounded-sm p-2 mb-2 border" />
        <input value={password}
               onChange={ev => setPassword(ev.target.value)}
               type="password"
               placeholder="password"
               className="block w-full rounded-sm p-2 mb-2 border" />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Dont have an account?
              <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
         
    </div>
    
  );
}