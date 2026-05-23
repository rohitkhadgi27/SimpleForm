import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IconButton } from 'rsuite';
import { FcGoogle } from "react-icons/fc";

type FormValues = {
    email: string,
    password: string
};

export const Login = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const [incorrectCredential, setIncorrectCredential] = useState(false);

    const handleLoginButton = async (data: FormValues) => {
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

            if (userData.email === data.email) {
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
            <h1>Login Form</h1>
            <div className="form-control">
                <label htmlFor="email">Email</label>
                <input type="text" id="email"
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Invalid email address',
                        },
                    })}
                    onChange={() => setIncorrectCredential(false)}
                />
                <p className="error">{errors.email?.message}</p>
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
                    onChange={() => setIncorrectCredential(false)}
                />
                <p className="error">{errors.password?.message}</p>
            </div>
            {incorrectCredential && (
                <p className="error">Incorrect credentials!</p>
            )}
            <button type="submit">Login</button>
            <a href="http://localhost:5000/auth/google">
                <IconButton
                    type="button"
                    icon={
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FcGoogle size={20} />
                            <span>Login with Google</span>
                        </div>
                    }
                />
            </a>
        </form>
    );
}