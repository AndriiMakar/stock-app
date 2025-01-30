import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { iConnectionStatusProps } from './types';

/**
 * Component to display the current connection status to the server
 * @param status - The current connection status
 */
const ConnectionStatus: React.FC<iConnectionStatusProps> = ({ status }) => {
  // Determine the label and color based on the status
  let statusText = '';
  let iconColor = '';
  let tooltipText = '';

  switch (status) {
    case 'connecting':
      statusText = 'Connecting...';
      iconColor = '#ff9800'; // Orange
      tooltipText = 'Attempting to connect to the server';
      break;
    case 'connected':
      statusText = 'Connected';
      iconColor = '#4caf50'; // Green
      tooltipText = 'Successfully connected to the server';
      break;
    case 'disconnected':
      statusText = 'Disconnected';
      iconColor = '#f44336'; // Red
      tooltipText = 'Disconnected from the server.';
      break;
    case 'error':
      statusText = 'Connection Error';
      iconColor = '#e91e63'; // Pink
      tooltipText = 'An error occurred with the connection';
      break;
    default:
      statusText = '';
      iconColor = '#000'; // Default to black
      tooltipText = '';
  }

  return (
    <Tooltip title={tooltipText} arrow placement="left-end">
      <Box display="flex" alignItems="center" mb={2}>
        <CircleIcon style={{ color: iconColor, marginRight: '8px' }} />
        <Typography variant="subtitle1" color="textPrimary">
          {statusText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ConnectionStatus;
