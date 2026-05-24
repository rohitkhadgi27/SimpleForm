import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";


export const UserPortal = () => {
    const API = import.meta.env.VITE_API_URL;
    const location = useLocation();
    const navigate = useNavigate();

    const inputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState(location.state?.user || null);
    const [loading, setLoading] = useState(true);

    const [secretText, setSecretText] = useState(user?.secret || "");

    useEffect(() => {
        // If user already exists from navigation, no need to fetch
        if (user) {
            setLoading(false);
            return;
        }
        // Otherwise, check session
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API}/secret`, {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.loggedIn) {
                    setUser(data.user);
                    setSecretText(data.secret);
                } else {
                    navigate("/");
                }
            } catch (err) {
                console.log(err);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSecretText = async () => {
        const body = {
            user: user,
            secretText: inputRef.current?.value ?? ""
        }
        try {
            const response = await fetch(`${API}/secretText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSecretText(data.secret);
        } catch (error) {
            console.log(error);
        }
    }

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API}/logout`, {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const userData = await response.text();
            if (userData === "logout") {
                navigate("/");
            }
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Hello! {user.email.split('@')[0]}</h1>
            <h2>Welcome to your Portal.</h2>
            <p><b>Your Secret Text : </b>{secretText}</p>
            <div className="center-input">
                <input type="text" className="secret-text" ref={inputRef}  placeholder="Type your secret text here" />
            </div>
            <div className="div">
                <button type="button" className="secret-color" onClick={handleSecretText} >
                    Submit
                </button>
                <button type="button" className="logout-color" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};
