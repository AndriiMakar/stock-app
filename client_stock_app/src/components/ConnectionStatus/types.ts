// Define the possible connection statuses
type ConnectionStatusType = 'connecting' | 'connected' | 'disconnected' | 'error';

// Define the props for the component
export interface iConnectionStatusProps {
  status: ConnectionStatusType;
}