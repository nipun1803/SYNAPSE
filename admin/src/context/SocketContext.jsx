import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { DoctorContext } from './DoctorContext';
import { AdminContext } from './AdminContext';

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const { dToken } = useContext(DoctorContext);
    const { aToken, backendUrl } = useContext(AdminContext); // AdminContext has backendUrl
    const [socket, setSocket] = useState(null);

    // Prioritize Doctor Token for Chat, but Admin might need it too later
    const token = dToken || aToken;

    useEffect(() => {
        if (token && backendUrl) {
            const newSocket = io(backendUrl, {
                auth: { token },
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                // console.log('Doctor/Admin Socket connected:', newSocket.id);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token, backendUrl]);

    const value = {
        socket
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
