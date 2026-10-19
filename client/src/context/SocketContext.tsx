import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  setUnreadCount: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      const s = getSocket();
      setSocket(s);

      s.on('message_notification', (data: { snippet: string }) => {
        toast.info(`New Message: ${data.snippet}`, {
          duration: 4000,
        });
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        s.off('message_notification');
      };
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => useContext(SocketContext);
