import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type FormValues = {
    username: string,
    password: string
};

export const Login = () => {
    const navigate = useNavigate();

    const form = useForm<FormValues>({
        defaultValues:{
            username: "",
            password: "",
        }
    }); 
    
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    
    const[incorrectCredential, setIncorrectCredential] = useState(false);

    const [loginButtonClicked, setLoginButtonClicked] = useState(false);

    useEffect(() => {
        { loginButtonClicked ? { handleLoginButton } : null };
    },[loginButtonClicked]);

    const loginButtonStateHandler = () => {
        setLoginButtonClicked(true);
    }
 
    const handleLoginButton = async () => {   
        setIncorrectCredential(false);
        try {
            const response = await fetch("http://localhost:5000/userInfo");
            if(!response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);              
            }
            const userInfoData = await response.json();
            const userInfoArray = userInfoData.map((data: { name: string, password: string }) => {
                return (data.name+" "+data.password);
            });
            if( userInfoArray.includes(userName+" "+userPassword) ) {
                navigate("/userPortal");
            }
            else if(userName === "" || userPassword === "") {
                        //do nothing
            }else {
                setIncorrectCredential(true);
            }    
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <form className="login-color" onSubmit={ handleSubmit(loginButtonStateHandler) } noValidate >
            <div className="form-control">
                <h1>Login Form</h1>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={userName} 
                    {...register("username", {
                        required: {
                            value: true,
                            message: "username is required"
                        },
                    })} 
                onChange= {e => setUserName(e.target.value)}
                />
                <p className="error">{errors.username?.message}</p>
            </div>

            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={userPassword}
                    {...register("password", {
                        required: {
                            value: true,
                            message: "password is required",
                        },
                    })} 
                onChange= {e => setUserPassword(e.target.value)}
                />
                <p className="error">{incorrectCredential ? "Incorrect username or password!" : errors.password?.message}</p>
            </div>        
            <button onClick={ handleLoginButton }>Login</button>    
        </form>
    );    
}