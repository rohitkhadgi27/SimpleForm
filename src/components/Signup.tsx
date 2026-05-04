import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { IconButton } from 'rsuite';
import { FcGoogle } from "react-icons/fc";

type FormValues = {
    username: string,
    email: string,
    password: string
};

export const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
     
    const signupSubmitButtonHandler = async (data: FormValues) => {
        try {
            const response = await fetch("http://localhost:5000/userInfo");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            const userInfoEmails = users.map((user: { email: string }) => user.email);
            if (userInfoEmails.includes(data.email)) {
                toast.error('Email already exists!', { position: "top-center" });
            } else {
                const response = await fetch("http://localhost:5000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                toast.success('Form submitted successfully!', { position: "top-center" });
                setUserEmail('');
                setUserPassword('');
            }
        } catch (error) {
            toast.error('There was an error submitting the form.');
            console.log(error);
        }
    };

    return (
        <div>
            <form className="signup-color" onSubmit={handleSubmit(signupSubmitButtonHandler)} noValidate >
                <h1>Signup Form</h1>
                {/* <div className="form-control">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={userName}
                        {...register("username", {
                            required: "Username is required",
                            pattern: {
                                value: /^[a-zA-Z0-9]+$/,
                                message: 'Username cannot contain special characters or spaces',
                            },
                            minLength: {
                                value: 3,
                                message: "Username must be at least 3 characters"
                            },
                            maxLength: {
                                value: 15,
                                message: "Username must not be more than 15 characters"
                            },
                        })}
                        onChange={e => setUserName(e.target.value)}
                    />
                    <p className="error">{errors.username?.message}</p>
                </div> */}

                <div className="form-control">
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" value={userEmail}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'Invalid email address',
                            },
                        })}
                        onChange={e => setUserEmail(e.target.value)}
                    />
                    <p className="error">{errors.email?.message}</p>
                </div>

                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={userPassword}
                        {...register("password", {
                            required: "Password is required",
                            pattern: {
                                value: /^[a-zA-Z0-9]+$/,
                                message: 'Password cannot contain special characters or spaces',
                            },
                            minLength: {
                                value: 5,
                                message: "Password must be at least 5 characters"
                            },
                            maxLength: {
                                value: 15,
                                message: "Password must not be more than 15 characters"
                            }
                        })}
                        onChange={e => setUserPassword(e.target.value)}
                    />
                    <p className="error">{errors.password?.message}</p>
                </div>
                <button>Submit</button>
                <a href="http://localhost:5000/auth/google">
                    <IconButton
                        type="button"
                        icon={
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FcGoogle size={20} />
                                <span>Sign Up with Google</span>
                            </div>
                        }
                    />
                </a>
            </form>
        </div>
    );
}
