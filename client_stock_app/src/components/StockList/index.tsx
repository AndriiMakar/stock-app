import React, { useState, memo } from 'react';
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { iStockListProps } from './types';

async function fetchStockList() {
  const response = await fetch('http://localhost:3001/api/stocks');
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch stocks list');
  }

  return resData;
}

/**
 * Component to display a list of stocks with checkboxes for selection
 * Allows users to select or deselect stocks they are interested in
 * @param onSelect - Callback function to pass the selected stocks to the parent component
 */
const StockList = ({ onSelect }: iStockListProps) => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const covertToStockList = (stocks: Record<string, number>) => Object.entries(stocks).map(([symbol, price]) => ({ symbol, price }));

  const {
    error,
    fetchedData,
  } = useFetch<Record<string, number>>(fetchStockList, {});

  const stocks = covertToStockList(fetchedData);

    /**
     * Handler for checkbox changes
     * Updates the local selected state based on user interaction
     * @param event - The checkbox change event
   */
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    let updatedSelection = [...selectedStocks];
    if (checked) {
      updatedSelection.push(name);
    } else {
      updatedSelection = updatedSelection.filter((s) => s !== name);
    }
    setSelectedStocks(updatedSelection);
    onSelect(updatedSelection);
  };

  return (
    <Box mb={4}>
      {error?.message &&     <Alert severity="error" sx={{ marginBottom: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error.message}
      </Alert>}

      <Typography variant="h5" gutterBottom>
        Select Stocks to Monitor
      </Typography>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <FormGroup>
          {stocks.map(({symbol}) => (
            <FormControlLabel
              key={symbol}
              control={
                <Checkbox
                  checked={selectedStocks.includes(symbol)}
                  onChange={handleCheckboxChange}
                  name={symbol}
                  color="primary"
                />
              }
              label={symbol}
            />
          ))}
        </FormGroup>
      </Paper>
    </Box>
  );
};

export default memo(StockList);
