import React from 'react';
import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { iErrorNotificationProps } from './types';

/**
 * Component to display error notifications with a retry button
 * @param message - The error message to display
 * @param onRetry - Function to call when the retry button is clicked
 */
const ErrorNotification: React.FC<iErrorNotificationProps> = ({ message, onRetry }) => {
  return (
    <Alert severity="error" sx={{ marginBottom: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {message}
      <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
        <Button variant="contained" color="error" onClick={onRetry}>
          Retry
        </Button>
      </Stack>
    </Alert>
  );
};

export default ErrorNotification;
