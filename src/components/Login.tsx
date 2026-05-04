import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type FormValues = {
    username: string,
    password: string
};

export const Login = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const [incorrectCredential, setIncorrectCredential] = useState(false);

    const [loginButtonClicked, setLoginButtonClicked] = useState(false);

    useEffect(() => {
        { loginButtonClicked ? { handleLoginButton } : null };
    }, [loginButtonClicked]);

    const handleLoginButton = async (data: FormValues) => {
        setLoginButtonClicked(true);
        setIncorrectCredential(false);
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const userData = await response.json();
            if (userData.name === data.username) {
                navigate("/userPortal", { state: { user: userData } });
            } else {
                setIncorrectCredential(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <form className="login-color" onSubmit={handleSubmit(handleLoginButton)} noValidate >
            <div className="form-control">
                <h1>Login Form</h1>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" 
                    {...register("username", {
                        required: {
                            value: true,
                            message: "username is required"
                        },
                    })}
                    onChange={e => e.target.value}
                />
                <p className="error">{errors.username?.message}</p>
            </div>

            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" 
                    {...register("password", {
                        required: {
                            value: true,
                            message: "password is required",
                        },
                    })}
                    onChange={e => e.target.value}
                />
                <p className="error">{incorrectCredential ? "Incorrect username or password!" : errors.password?.message}</p>
            </div>
            <button type="submit">Login</button>
        </form>
    );
}