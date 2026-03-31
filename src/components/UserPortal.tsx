import { useState } from "react";

export const UserPortal = () => {

    const [user, setUser] = useState('')

    const jsonData = async () => {   
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
            const userName = data.map((item: { username: string }) => item.username);
            for(let un of userName) {
                if(un == user) {
                    console.log(un + " matches " + user);
                }
            }

        } catch (error) {
            console.log(error);
        }      
    }

    return(
        <div>
            Hello! User 
            <input type="text" placeholder="Enter your name" onChange={(e) => setUser(e.target.value)}/>
            <button onClick={jsonData}>Get Data</button>
        </div>
    );
}