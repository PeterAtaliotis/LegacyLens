import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="btn btn-secondary" onClick={() => loginWithRedirect({
    audience: `http://localhost:8080`,
    scope: 'openid profile email read:current_user update:current_user_metadata'
  })}>Log In</button>;
};

export default LoginButton;