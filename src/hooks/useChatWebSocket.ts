'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const RECONNECT_BACKOFF_FACTOR = 1.5;

export const useChatWebSocket = (url: string = DEFAULT_WS_URL) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectDelay = useRef(INITIAL_RECONNECT_DELAY);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = undefined;
    }
  }, []);

  const resetConnection = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  const connect = useCallback(() => {
    try {
      // Clear any existing connection
      resetConnection();

      // Create new connection
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setError(null);
        reconnectDelay.current = INITIAL_RECONNECT_DELAY; // Reset delay on successful connection
        clearReconnectTimeout();
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectDelay.current < MAX_RECONNECT_DELAY) {
          reconnectTimeout.current = setTimeout(() => {
            reconnectDelay.current = Math.min(
              reconnectDelay.current * RECONNECT_BACKOFF_FACTOR,
              MAX_RECONNECT_DELAY
            );
            connect();
          }, reconnectDelay.current);
        } else {
          setError('Failed to connect after multiple attempts. Please refresh the page to try again.');
        }
      };

      ws.current.onerror = (event: Event) => {
        const wsEvent = event as ErrorEvent;
        console.error('WebSocket Error:', {
          type: event.type,
          message: wsEvent.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        setError('WebSocket connection error. Please check your connection and try again.');
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data as string);
          if (parsedData.error) {
            setError(`Server error: ${parsedData.error}`);
            return;
          }
          setLastMessage(event.data);
          setError(null);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error parsing WebSocket message:', errorMessage);
          setError(`Invalid message format received: ${errorMessage}`);
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to connect to WebSocket:', error);
      setError(`Failed to establish WebSocket connection: ${errorMessage}`);
      
      // Attempt to reconnect with exponential backoff
      if (reconnectDelay.current < MAX_RECONNECT_DELAY) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectDelay.current = Math.min(
            reconnectDelay.current * RECONNECT_BACKOFF_FACTOR,
            MAX_RECONNECT_DELAY
          );
          connect();
        }, reconnectDelay.current);
      }
    }
  }, [url, resetConnection, clearReconnectTimeout]);

  useEffect(() => {
    connect();
    return () => {
      resetConnection();
      clearReconnectTimeout();
    };
  }, [connect, resetConnection, clearReconnectTimeout]);

  const sendMessage = useCallback((message: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected. Please try again.');
      return;
    }

    try {
      // Validate that the message is valid JSON before sending
      JSON.parse(message);
      ws.current.send(message);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${errorMessage}`);
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    error
  };
};