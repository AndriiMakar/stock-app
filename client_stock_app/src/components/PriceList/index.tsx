import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { iPriceListProps } from './types';

/**
 * Component to display the latest prices of selected stocks in a table format
 * @param prices - An object containing stock symbols as keys and their latest prices as values
 * @param selectedStocks - An array of stock symbols that are currently selected by the user
 */
const PriceList: React.FC<iPriceListProps> = ({ prices, selectedStocks }) => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: '40px' }}>
      <Typography variant="h6" sx={{ padding: 2 }}>
        Stock Prices
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            <TableCell align="right">Price ($)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedStocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} align="center">
                No stocks selected.
              </TableCell>
            </TableRow>
          ) : (
            selectedStocks.map((stock) => (
              <TableRow key={stock}>
                <TableCell component="th" scope="row">
                  {stock}
                </TableCell>
                <TableCell align="right">
                  {prices[stock] !== undefined ? prices[stock].toFixed(2) : 'Loading...'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PriceList;
