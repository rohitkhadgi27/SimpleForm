import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';

type FormValues = {
    username: string,
    password: string
};

export const Signup = () => {
    const form = useForm<FormValues>({
        defaultValues: {
            username: "",
            password: "",
        }
    });
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;

    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const signupSubmitButtonHandler = async () => {
        try {
            const body = {
                username: userName,
                password: userPassword
            };
            const response = await fetch("http://localhost:5000/userInfo");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const datas = await response.json();
            const userInfoNames = datas.map((data: { name: string }) => data.name);
            if (userInfoNames.includes(userName)) {
                toast.error('Username already exists!', { position: "top-center" });
            } else {
                const response = await fetch("http://localhost:5000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                toast.success('Form submitted successfully!', { position: "top-center" });
                setUserName('');
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
                <div className="form-control">
                    <h1>Signup Form</h1>
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
            </form>
        </div>
    );
}

//const effectRan = useRef(false);
//const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
// useEffect(() => {
//     if(effectRan.current === false){
//         { setSubmitButtonClicked(true) }
//         { submitButtonClicked ? { signupSubmitButtonHandler } : null };
//         return () => {
//             effectRan.current = true;
//         }
//     }
// },[submitButtonClicked]);