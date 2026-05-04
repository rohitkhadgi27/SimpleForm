import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const UserPortal = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(location.state?.user || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If user already exists from navigation, no need to fetch
        if (user) {
            setLoading(false);
            return;
        }
        // Otherwise, check session
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/secret", {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.loggedIn) {
                    setUser(data.user);
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

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/logout", { 
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
            <button type="button" className="login-color" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};
