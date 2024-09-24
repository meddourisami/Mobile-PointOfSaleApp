import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import {useSync} from "../SyncContext";

export const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true); // New loading state
    const { token } = useSync();

    const getUserCompany = async () => {
        let constructedProfile = {};
        try {
            const user = await AsyncStorage.getItem('user');
            constructedProfile = { name: user, email: user };
            const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.search.search_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({
                    "txt": "",
                    "doctype": "Company",
                    "ignore_user_permissions": 0,
                    "reference_doctype": "Sales Order",
                    "page_length": 1
                }),
            });

            if (response.ok) {
                const json = await response.json();
                const company = json.message[0].value;
                constructedProfile = { ...constructedProfile, company };
                const response1 = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.search.search_link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                    body: JSON.stringify({
                        "txt": "",
                        "doctype": "Warehouse",
                        "ignore_user_permissions": 0,
                        "reference_doctype": "Sales Order",
                        "page_length": 1,
                    }),
                });

                if (response1.ok) {
                    const json1 = await response1.json();
                    const warehouse = json1.message[0].value;
                    constructedProfile = { ...constructedProfile, warehouse };

                    const response2 = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.load.getdoc', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token,
                        },
                        body: JSON.stringify({
                            "doctype": "Company",
                            "name": company,
                            "_": Date.now(),
                        }),
                    });

                    if (response2.ok) {
                        const json2 = await response2.json();
                        const companyDetails = json2.docs[0];
                        const { country, default_currency, default_bank_account, default_expense_account, default_receivable_account, default_cash_account } = companyDetails;

                        constructedProfile = {
                            ...constructedProfile,
                            country,
                            currency: default_currency,
                            default_bank_account,
                            default_expense_account,
                            default_receivable_account,
                            default_cash_account
                        };
                        setUserProfile(constructedProfile);  // Set final profile
                        setProfileLoading(false);  // Data fetching completed
                    }
                }
            }
        } catch (e) {
            console.log('Error fetching user company:', e);
            setProfileLoading(false);  // Handle error case and stop loading
        }
    };

    useEffect(() => {
        getUserCompany();
    }, []);

    return (
        <ProfileContext.Provider value={{ userProfile, profileLoading }}>
            {children}
        </ProfileContext.Provider>
    );
};
