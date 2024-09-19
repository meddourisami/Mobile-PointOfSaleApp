/*
// DeliveryNoteLogsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {useSQLiteContext} from "expo-sqlite";

// Open or create the SQLite database
const db = useSQLiteContext();

// Create the context
const DeliveryNoteLogsContext = createContext();

// Create the provider component
export const DeliveryNoteLogsProvider = ({ children }) => {
    const [deliveryNotes, setDeliveryNotes] = useState([]);

    useEffect(() => {
        // Create the table if it doesn't exist
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS delivery_note_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT,
          name TEXT UNIQUE,
          state TEXT,
          data TEXT
        );`
            );
        });

        // Fetch all records when the component mounts
        fetchAllRecords();
    }, []);

    // Fetch all records from the table
    const fetchAllRecords = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM delivery_note_logs',
                [],
                (txObj, resultSet) => {
                    setDeliveryNotes(resultSet.rows._array);
                },
                (txObj, error) => {
                    console.error('Error fetching records:', error);
                }
            );
        });
    };

    // Delete a record by name
    const deleteRecordByName = (name) => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM delivery_note_logs WHERE name = ?',
                [name],
                () => {
                    // Refresh the list after deletion
                    fetchAllRecords();
                },
                (txObj, error) => {
                    console.error('Error deleting record:', error);
                }
            );
        });
    };

    // Delete all records from the table
    const deleteAllRecords = () => {
        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM delivery_note_logs',
                [],
                () => {
                    // Refresh the list after deletion
                    fetchAllRecords();
                },
                (txObj, error) => {
                    console.error('Error deleting all records:', error);
                }
            );
        });
    };

    // Get a record by name
    const getRecordByName = (name) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM delivery_note_logs WHERE name = ?',
                    [name],
                    (txObj, resultSet) => {
                        resolve(resultSet.rows._array[0] || null);
                    },
                    (txObj, error) => {
                        reject(error);
                    }
                );
            });
        });
    };

    return (
        <DeliveryNoteLogsContext.Provider
            value={{
                deliveryNotes: deliveryNotes,
                fetchAllRecords,
                deleteRecordByName,
                deleteAllRecords,
                getRecordByName
            }}
        >
            {children}
        </DeliveryNoteLogsContext.Provider>
    );
};

*/
