import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';

type FormValues = {
    email: string,
    recoveryEmail: string,
    password: string
};

export const Signup = () => {
    const API = import.meta.env.VITE_API_URL;
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const signupSubmitButtonHandler = async (data: FormValues) => {
        try {
            const response = await fetch(`${API}/userInfo`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            const userInfoEmails = users.map((user: { email: string }) => user.email);
            if (userInfoEmails.includes(data.email)) {
                toast.error('Email already exists!', { position: "top-center" });
            } else {
                const response = await fetch(`${API}/signup`, {
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
                setRecoveryEmail('');
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
                <div className="form-control">
                    <label htmlFor="recoveryEmail">Recovery Email</label>
                    <input type="text" id="recoveryEmail" value={recoveryEmail}
                        {...register("recoveryEmail", {
                            required: "Recovery email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'Invalid email address',
                            },
                        })}
                        onChange={e => setRecoveryEmail(e.target.value)}
                    />
                    <p className="error">{errors.recoveryEmail?.message}</p>
                </div>
                <button>Submit</button>
            </form>
        </div>
    );
}
