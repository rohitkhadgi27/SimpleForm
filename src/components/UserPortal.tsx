import { useLocation } from 'react-router-dom';

export const UserPortal = () => {
    const location = useLocation();
    const  { name, password }  = location.state;

    return(
        <div>
            <h2>Hello! {name} {password}</h2>
            <p>Welcome to your Portal.</p>
        </div>
    );
}