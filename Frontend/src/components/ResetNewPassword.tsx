import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

type FormValues = {
    password: string;
    confirmPassword: string;
};

export const ResetNewPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    const handleReset = async (data: FormValues) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match!', { position: "top-center" });
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/update-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: data.password }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate("/"), 2000);
            } else {
                toast.error('Token expired or invalid', { position: "top-center" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form className="update-color" onSubmit={handleSubmit(handleReset)} noValidate>
            <h1>Create New Password</h1>

            {!success ? (
                <>
                    <div className="form-control">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password", { required: "Password is required" })}
                        />
                        <p className="error">{errors.password?.message}</p>
                    </div>

                    <div className="form-control">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...register("confirmPassword", { required: "Confirm your password" })}
                        />
                        <p className="error">{errors.confirmPassword?.message}</p>
                    </div>

                    <button type="submit" className="update-btn" style={{ marginTop: "20px" }}>
                        Update Password
                    </button>
                </>
            ) : (
                <p style={{ marginTop: "20px", color: "#4caf50" }}>
                    Password updated! Redirecting to login…
                </p>
            )}
        </form>
    );
};
