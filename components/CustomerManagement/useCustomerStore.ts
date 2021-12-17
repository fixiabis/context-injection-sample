import { useState } from 'react';

export interface CustomerStore {
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((customers: Customer[]) => Customer[])) => void;
}

const useCustomerStore = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  return { customers, setCustomers };
};

export default useCustomerStore;
