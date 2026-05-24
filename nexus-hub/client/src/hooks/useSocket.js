import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

let socket = null;

export const useSocket = () => {
  const { token, prependActivity, updateWorkflow } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!token || initialized.current) return;
    initialized.current = true;

    socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));

    socket.on('activity:new', (item) => {
      prependActivity({ ...item, createdAt: new Date() });
    });

    socket.on('workflow:toggled', ({ id, status }) => {
      updateWorkflow({ _id: id, status });
    });

    socket.on('execution:complete', ({ workflowId, status }) => {
      // Could trigger a refetch here
    });

    return () => {
      socket?.disconnect();
      initialized.current = false;
    };
  }, [token]);

  return socket;
};

export const getSocket = () => socket;
