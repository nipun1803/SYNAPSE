import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from './AppContext';

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const { userData, backendUrl } = useContext(AppContext);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (userData) {
            // Establish connection - no token needed, app uses cookie-based auth
            const newSocket = io(backendUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                // console.log('Socket connected:', newSocket.id); // Removed
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            // If no userData (not logged in), ensure socket is closed
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [userData, backendUrl]);

    const value = {
        socket
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
