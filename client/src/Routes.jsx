import RegisterAndLoginForm from "./RegisterAndLoginForm.jsx";
import {useContext, useEffect} from "react";
import {UserContext} from "./UserContext.jsx";
import Chat from "./Chat";
import { useState } from "react";

export default function Routes() {
  console.log("routes getting rendered");
  const {username, id} = useContext(UserContext);

 if (username) {
    return <Chat />;
  }
  return (
    <RegisterAndLoginForm />
  );

}