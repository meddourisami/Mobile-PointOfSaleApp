import React, { createContext, useContext, useState } from 'react';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
    const [initialBudget, setInitialBudget] = useState(1000);

    const updateBudget = (paidAmount) => {

        setInitialBudget((prevBudget) => Number(prevBudget) + Number(paidAmount));
    };

    return (
        <BudgetContext.Provider value={{initialBudget, updateBudget }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    return useContext(BudgetContext);
};
