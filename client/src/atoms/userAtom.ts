import axios from "axios";
import { atom } from "jotai";

// Atom to store the session id
const storedSessionId = localStorage.getItem("sessionId");
export const sessionIdAtom = atom<string | null>(storedSessionId);

// Retrieve user data from local storage
const storedUserData = localStorage.getItem("userData");
const initialUserData = storedUserData ? JSON.parse(storedUserData) : null;

// Atom to store the user data
export const userAtom = atom(initialUserData);

export const fetchUserAtom = atom(
    (get) => get(userAtom),
    async (get, set) => {
        console.log("fetchUser called");
        const sessionId = get(sessionIdAtom);
        if (!sessionId) {
            console.error("No session ID found");
            return;
        }
        try {
            const response = await axios.get(`https://theory-web.azurewebsites.net/user/${sessionId}`, {
                headers: {
                    Accept: "application/json",
                },
            });
            console.log("Full Response:", response);
            const userData = response.data;
            set(userAtom, userData);
			localStorage.setItem("userData", JSON.stringify(userData));
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    }
);
