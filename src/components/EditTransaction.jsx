import { useState } from "react";
import { expenseCategories, incomeCategories } from "../utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from '../context/AuthContext';

export default function EditTransaction(props) {
    const { handleCloseModal, transactionID, transactionData } = props;
    
    // Form state for editing entries
    const [transactionType, setTransactionType] = useState(transactionData["type"]);
    const [transactionCategory, setTransactionCategory] = useState(transactionData["category"]);
    const [transactionCost, setTransactionCost] = useState(transactionData["amount"]);
    const [transactionDescription, setTransactionDescription] = useState(transactionData["description"]);
    
    const { globalData, setGlobalData, globalUser } = useAuth();
    
    async function handleEditEntry() {
        if (!globalUser) return;

        try {
            const newData = {
                "category": transactionCategory,
                "amount": parseFloat(transactionCost), 
                "type": transactionType,
                "description": transactionDescription || transactionType 
            };

            // Update data locally
            const newGlobalData = {...globalData};
            newGlobalData[transactionID] = newData;
            setGlobalData(newGlobalData);

            // Update data in the firestore database
            const userRef = doc(db, 'users', globalUser.uid);
            await updateDoc(userRef, {
                [transactionID]: newData
            });

            console.log(`Transaction ${transactionID} updated successfully`);
            handleCloseModal(); // Close the modal after successful update
        } catch (err) {
            console.error("Error updating transaction:", err);
            alert("Failed to update transaction. Please try again.");
        }
    }

    return (
        <div className="edit-transaction-form">
            <div className="edit-transaction-header">
                <h2>Edit Transaction</h2>
            </div>
            
            <h3>Transaction Type</h3>
            <select 
                value={transactionType} 
                onChange={(e) => setTransactionType(e.target.value)}
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

            <h3>Transaction Category</h3>
            <select 
                value={transactionCategory} 
                onChange={(e) => setTransactionCategory(e.target.value)}
            >
                {transactionType === "income" ? (
                    incomeCategories.map((incomeCat, index) => (
                        <option key={index} value={incomeCat}>{incomeCat}</option>
                    ))
                ) : (
                    expenseCategories.map((expenseCat, index) => (
                        <option key={index} value={expenseCat}>{expenseCat}</option>
                    ))
                )}
            </select>

            <h3>Transaction Amount</h3>
            <input 
                type="number" 
                placeholder="e.g 45.78" 
                value={transactionCost} 
                onChange={(e) => setTransactionCost(e.target.value)}
            />
            
            <h3>Transaction Description <span className="optional-text">* Not required</span></h3>
            <input 
                type="text" 
                placeholder="Movie tickets and snacks" 
                value={transactionDescription} 
                onChange={(e) => setTransactionDescription(e.target.value)}
            />
            
            <div className="edit-transaction-buttons">
                <button 
                    className="confirm-edit-btn"
                    onClick={handleEditEntry}
                >
                    <p>Confirm Edit</p>
                </button>
                <button 
                    className="cancel-edit-btn"
                    onClick={handleCloseModal}
                >
                    <p>Cancel</p>
                </button>
            </div>
        </div>
    );
}