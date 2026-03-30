import { IconButton } from 'rsuite';
import { ArrowRight, ArrowLeft } from '@rsuite/icons';
import { Login } from './Login.tsx';
import { Signup } from './Signup.tsx';
import { useState } from 'react';

export const MainForm = () => {
  const [displayLoginForm, setDisplayLoginForm] = useState(true);
  const [displaySignupForm, setDisplaySignupForm] = useState(false);


  const [displayLoginButton, setDisplayLoginButton] = useState(false);
  const [displaySignupButton, setDisplaySignupButton] = useState(true);

  const [signupButtonClicked, setSignupButtonClicked] = useState(false);
  const [loginButtonClicked, setLoginButtonClicked] = useState(false);

  // const buttonHandler = () => {
  //   setButtonClicked(true);
  // }

  // useEffect(() => {
  //   {buttonClicked && buttonSignupHandler()}
  // }, [buttonClicked]); 

  const loginButtonHandler = () => {
    setLoginButtonClicked(true);
    setSignupButtonClicked(false);
    setDisplayLoginForm(false);
    setDisplaySignupForm(false);
    setDisplaySignupButton(true);
    setDisplayLoginButton(false);
  }

  const signupButtonHandler = () => {
    setSignupButtonClicked(true);
    setLoginButtonClicked(false);
    setDisplaySignupForm(false);
    setDisplayLoginForm(false);
    setDisplayLoginButton(true);
    setDisplaySignupButton(false);
  }

  return ( 
    <div>
      { displayLoginForm ? <Login /> : null }
      { displaySignupForm ? <Signup /> : null }

      { loginButtonClicked ? <Login /> : null }
      { signupButtonClicked ? <Signup /> : null }     
      
      { displayLoginButton ? <IconButton type="button" icon={<ArrowLeft />} className="login-color" onClick= { loginButtonHandler }>Go to Login</IconButton> : null }
      { displaySignupButton ? <IconButton type="button" icon={<ArrowRight />} className="signup-color" onClick= { signupButtonHandler }>Go to Sign up</IconButton> : null }
    </div>
  )
}