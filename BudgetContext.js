import React, { createContext, useContext, useState } from 'react';

// Create the BudgetContext
const BudgetContext = createContext();

// BudgetProvider Component
export const BudgetProvider = ({ children }) => {
    const [initialBudget, setInitialBudget] = useState(0);

    // Function to add an amount to the initial budget
    const addBudgetAmount = (amount) => {
        setInitialBudget((prevBudget) => prevBudget + Number(amount));
    };

    // Function to subtract an amount from the initial budget
    const subtractBudgetAmount = (amount) => {
        setInitialBudget((prevBudget) => prevBudget - Number(amount));
    };

    // Function to update the budget to a specific amount
    const updateBudget = (newAmount) => {
        setInitialBudget(Number(newAmount));
    };

    return (
        <BudgetContext.Provider value={{ initialBudget, addBudgetAmount, subtractBudgetAmount, updateBudget }}>
            {children}
        </BudgetContext.Provider>
    );
};

// Custom Hook to use the BudgetContext
export const useBudget = () => {
    return useContext(BudgetContext);
};
