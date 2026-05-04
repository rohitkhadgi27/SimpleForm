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

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Hello! {user.name}</h1>
            <h2>Welcome to your Portal.</h2>
        </div>
    );
};
