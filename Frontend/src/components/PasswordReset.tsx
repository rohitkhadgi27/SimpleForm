import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

type FormValues = {
    email: string,
    recoveryEmail: string
};

export const PasswordReset = () => {
    const API = import.meta.env.VITE_API_URL;
    const [emailSent, setEmailSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const handleReset = async (data: FormValues) => {
        try {
            const res = await fetch(`${API}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, recoveryEmail: data.recoveryEmail }),
            });

            if (res.ok) {
                setEmailSent(true);
            } else {
                const errorData = await res.json();
                if (errorData.message === "Email and recovery email do not match") {
                    toast.error('Email and recovery email do not match!', { position: "top-center" });
                }
                console.error("Failed to send reset email");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form className="reset-color" onSubmit={handleSubmit(handleReset)} noValidate>
            <h1 style={{ color: "#3d3f74" }}>Password Reset</h1>

            {!emailSent ? (
                <>
                    <div className="form-control">
                        <label htmlFor="email">Enter your email</label>
                        <input
                            type="text"
                            id="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        <p className="error">{errors.email?.message}</p>
                    </div>
                    <div className="form-control">
                        <label htmlFor="recoveryEmail">Enter your recovery email</label>
                        <input
                            type="text"
                            id="recoveryEmail"
                            {...register("recoveryEmail", {
                                required: "Recovery email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid recovery email address",
                                },
                            })}
                        />
                        <p className="error">{errors.recoveryEmail?.message}</p>
                    </div>
                    <div style={{ display: "grid", alignItems: "center", gap: "30px" }}>
                        <button type="submit" className="reset-btn">
                            Send Reset Link
                        </button>

                        <a href="/" style={{ fontSize: "14px" }}>
                            Back to login page
                        </a>
                    </div>
                </>
            ) : (
                <p style={{ marginTop: "20px", color: "#4caf50" }}>
                    A password reset link has been sent to your email.
                </p>
            )}
        </form>
    );
}
