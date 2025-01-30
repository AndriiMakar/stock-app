/**
 * Define the props for the PriceList component.
 */
export interface iPriceListProps {
  prices: Record<string, number>;
  selectedStocks: string[];
}