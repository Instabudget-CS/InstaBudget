import type { Category, TransactionItem } from "./types";

export const mockExtractedData = {
  merchant: "Whole Foods Market",
  amount: "47.82",
  category: "groceries" as Category,
  txnDate: new Date().toISOString().split("T")[0],
  notes: "",
  items: [
    { name: "Organic Bananas", price: 4.99 },
    { name: "Whole Milk", price: 3.49 },
    { name: "Organic Eggs", price: 5.99 },
    { name: "Bread", price: 2.99 },
    { name: "Chicken Breast", price: 12.99 },
    { name: "Spinach", price: 3.99 },
    { name: "Tomatoes", price: 4.38 },
  ] as TransactionItem[],
};
