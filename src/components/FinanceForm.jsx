import React, { useEffect, useState } from 'react';
import { 
    calculateTotalMonthlySpending,
    calculateTotalMonthlyIncome,
    getMonthlyExpensesByCategory,
    getMonthlyIncomeByCategory,
    getCategoryIcon,
    formatTimestamp,
    incomeCategories,
    expenseCategories,
    createTimestamp, 
} from "../utils"
import Authentication from './Authentication';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';
import EditTransaction from './EditTransaction';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
  
export default function FinanceForm(props){
    const { isAuthenticated, isData, isLoading} = props
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate(); // Initialize navigation
    
    // Global stuff
    const { globalData, setGlobalData, globalUser } = useAuth()
    
    // Current month for display
    const [currentMonth, setCurrentMonth] = useState("")
    const [currentMonthNumber, setCurrentMonthNumber] = useState(new Date().getMonth())
    
    // Financial data state - initialize to null
    const [totalSpending, setTotalSpending] = useState(null);
    const [totalIncome, setTotalIncome] = useState(null);
    const [expenseByCat, setExpenseByCat] = useState(null);
    const [incomeByCat, setIncomeByCat] = useState(null);
    
    // Sorted transactions state
    const [sortedExpenses, setSortedExpenses] = useState([]);
    const [sortedIncome, setSortedIncome] = useState([]);

    // UI state
    const [expenseTab, setExpenseTab] = useState("overall")
    const [incomeTab, setIncomeTab] = useState("overall")

    const [showAllExpenses, setShowAllExpenses] = useState(false)
    const [showAllIncome, setShowAllIncome] = useState(false)
    
    // Initialize with empty arrays instead of null
    const [expensesToShow, setExpensesToShow] = useState([])
    const [incomeToShow, setIncomeToShow] = useState([])

    // Form state for adding entries
    const [transactionType, setTransactionType] = useState("type-base")
    const [transactionCategory, setTransactionCategory] = useState("category-base")
    const [transactionCost, setTransactionCost] = useState("")
    const [transactionDescription, setTransactionDescription] = useState("")
    
    const [isEditEntry, setIsEditEntry] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null);

    function handleCloseModal(){
        setShowModal(false)
        setIsEditEntry(false)
    }

    // Initialize current month when component mounts
    useEffect(() => {
        const now = new Date();
        setCurrentMonth(now.toLocaleString('default', { month: 'long' }));
        setCurrentMonthNumber(now.getMonth());
    }, []);

    function filterIncomeToCurrentMonth() {
        // Goes into the globalData and filters for current month income transactions
        if (!globalData) return [];
        
        try {
            const filtered = Object.entries(globalData).filter(([time, details]) => {
                if (!details || !details.type) return false;
                
                const entryDate = new Date(parseInt(time, 10));
                const entryMonth = entryDate.getMonth();
                
                return details.type.toLowerCase() === "income" && entryMonth === currentMonthNumber;
            });
            
            return filtered;
        } catch (err) {
            console.error("Error filtering income transactions:", err);
            return [];
        }
    }
    
    function filterExpensesToCurrentMonth() {
        // Goes into the globalData and filters for current month expenses transactions
        if (!globalData) return [];
        
        try {
            const filtered = Object.entries(globalData).filter(([time, details]) => {
                if (!details || !details.type) return false;
                
                const entryDate = new Date(parseInt(time, 10));
                const entryMonth = entryDate.getMonth();
                
                return details.type.toLowerCase() === "expense" && entryMonth === currentMonthNumber;
            });
            
            return filtered;
        } catch (err) {
            console.error("Error filtering expense transactions:", err);
            return [];
        }
    }

    // Update calculated values when globalData changes
    useEffect(() => {
        if (globalData) {
            try {
                // Update financial calculations
                setTotalSpending(calculateTotalMonthlySpending(globalData));
                setTotalIncome(calculateTotalMonthlyIncome(globalData));
                setExpenseByCat(getMonthlyExpensesByCategory(globalData));
                setIncomeByCat(getMonthlyIncomeByCategory(globalData));
                
                // Update sorted transactions
                const expenseTransactions = filterExpensesToCurrentMonth();
                console.log("Found expense transactions:", expenseTransactions.length);
                
                const sortedExpensesData = expenseTransactions.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
                setSortedExpenses(sortedExpensesData);
                
                // Extract and sort income transactions
                const incomeTransactions = filterIncomeToCurrentMonth();
                console.log("Found income transactions:", incomeTransactions.length);
                
                const sortedIncomeData = incomeTransactions.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
                setSortedIncome(sortedIncomeData);
            } catch (err) {
                console.error("Error processing transaction data:", err);
                setSortedExpenses([]);
                setSortedIncome([]);
            }
        }
    }, [globalData, currentMonthNumber]); // Re-run when globalData or currentMonthNumber changes
    
    // Add separate useEffects to update expensesToShow and incomeToShow
    useEffect(() => {
        setExpensesToShow(showAllExpenses ? sortedExpenses : sortedExpenses.slice(0, 3));
    }, [sortedExpenses, showAllExpenses]);
    
    useEffect(() => {
        setIncomeToShow(showAllIncome ? sortedIncome : sortedIncome.slice(0, 3));
    }, [sortedIncome, showAllIncome]);

    // Add new transaction entry
    async function addEntry(category, amount, type, description, callback) {
        // Validate inputs
        if (!category || !amount || !type || category === "category-base" || type === "type-base") {
            alert("Please fill in all required fields");
            return;
        }
        
        // Ensure amount is a positive number
        const numericAmount = Math.abs(parseFloat(amount));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds(); // Add seconds for more unique timestamps
        const timestamp = createTimestamp(year, month, day, hour, minutes, seconds);
        
        try {
            const newData = {           
                "category": category,
                "amount": numericAmount,
                "type": type,
                "description": description || type
            }
    
            // First operation - update local state
            const newGlobalData = {...(globalData || {})};
            newGlobalData[timestamp] = newData;
            
            console.log("Adding new entry:", timestamp, newData);
            
            setGlobalData(newGlobalData);
    
            // Second operation - update firebase
            if (globalUser) {
                const userRef = doc(db, 'users', globalUser.uid);
                await setDoc(userRef, {
                    [timestamp]: newData
                }, {merge: true});
                
                console.log("Entry added to Firebase successfully");
            }
            
            // Call the callback to refresh data and reset form
            if (callback) callback();
            
        } catch (err) {
            console.error("Error adding entry:", err);
            alert("Failed to add entry. Please try again.");
        }
    }
    
    // Delete transaction entry
    async function deleteEntry(timestamp) {
        if (!globalUser) {
            alert("You must be logged in to delete entries");
            return;
        }
        
        try {
            // First update local state
            const newGlobalData = {...globalData};
            delete newGlobalData[timestamp];
            setGlobalData(newGlobalData);
            
            // Then update Firebase
            const userRef = doc(db, 'users', globalUser.uid);
            await updateDoc(userRef, {
                [timestamp]: deleteField()
            });
            
            console.log(`Transaction ${timestamp} deleted successfully`);
        } catch (err) {
            console.error("Error deleting transaction:", err);
            alert("Failed to delete transaction. Please try again.");
        }
    }

    function changeEditEntry(transDate) {
        // Logic for editing a details card
        if (!globalData || !globalData[transDate]) {
            alert("Cannot edit this entry at the moment. Please try again.");
            return;
        }
        
        setEditingTransaction(transDate);
        setShowModal(true);
        setIsEditEntry(true);
    }

    // Form submission handler
    const handleAddEntry = () => {
        if (!isAuthenticated){
            setShowModal(true);
            return;
        }
        
        addEntry(
            transactionCategory, 
            transactionCost, 
            transactionType, 
            transactionDescription,
            () => {
                // Reset form fields
                setTransactionType("type-base");
                setTransactionCategory("category-base");
                setTransactionCost("");
                setTransactionDescription("");
            }
        );
    }

    // Navigate to detailed tracking pages
    const navigateToTrackEverything = (type) => {
        if (!isAuthenticated) {
            setShowModal(true);
            return;
        }
        navigate(`/track/${type.toLowerCase()}`);
    };

    // Render the Monthly Summary Section with null checks
    const renderMonthlySummary = () => {
        if (totalIncome === null || totalSpending === null) {
            return <p>No financial data available yet</p>;
        }
        
        return (
            <div className="monthly-summary">
                <div className="summary-title">
                    <h3>Summary for {currentMonth}</h3>
                </div>
                <div className="monthly-summary-contents">
                    <h5 className="income-value">Income: ${totalIncome}</h5>
                    <h5 className="expense-value">Expenses: $-{totalSpending}</h5>
                    <h5 className="total-value">Total: ${totalIncome-totalSpending}</h5>
                </div>
            </div>
        );
    }

    // Render the Expenses Section with null checks
    const renderExpensesSection = () => {
        if (expenseByCat === null) {
            return null;
        }
        
        return (
            <div className="finance-form expense-form">
                <div className="expenses-title">
                    <h3>Expenses for {currentMonth}</h3>
                </div>

                <div className="switch-tab-buttons flex flex-wrap justify-center gap-4">
                    <button className="flex items-center justify-center px-4 py-2 text-center" 
                        onClick={() => {setExpenseTab("overall"); setShowAllExpenses(false)}}>
                        <h3>Overall</h3>
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 text-center" 
                        onClick={() => {setExpenseTab("details"); setShowAllExpenses(false)}}>
                        <h3>Details</h3>
                    </button>
                    <button className="track-everything-btn flex items-center justify-center px-4 py-2 text-center"
                        onClick={() => navigateToTrackEverything("expenses")}>
                        <h3>Track Everything</h3>
                    </button>
                </div>

            
                {expenseTab === "overall" ? (
                    Object.entries(expenseByCat).map(([category, amount], index) => (
                        <div className="expenses-overview-card" key={index}>
                            <i className={getCategoryIcon(category)}/>
                            <p>{category}: $-{amount}</p>
                        </div>
                    ))
                ) : (
                    <>
                        {expensesToShow && expensesToShow.length > 0 ? (
                            expensesToShow.map(([transDate, transDetails], index) => {
                                const timestamp = parseInt(transDate, 10);
                                return (
                                    <div className="transaction-card expenses-card" key={index}> 
                                        <div className="transaction-card-header">
                                            <p className="transaction-card-date expenses-card-date">{formatTimestamp(timestamp, "date-only")}</p>
                                            <div className="transaction-card-actions">
                                                <button 
                                                    className="transaction-edit-btn"
                                                    onClick={() => changeEditEntry(transDate)}
                                                    title="Edit transaction"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    className="transaction-delete-btn"
                                                    onClick={() => deleteEntry(transDate)}
                                                    title="Delete transaction"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="transaction-card-row expenses-card-row">
                                            <span className="transaction-card-label expenses-card-label">Category:</span>
                                            <span className="transaction-card-value expenses-card-value">{transDetails.category}</span>
                                        </div>
                                        
                                        <div className="transaction-card-row expenses-card-row">
                                            <span className="transaction-card-label expenses-card-label">Amount:</span>
                                            <span className={`transaction-card-amount expenses-card-amount expense`}>
                                                ${transDetails.amount}
                                            </span>
                                        </div>
                                        
                                        <div className="transaction-card-row expenses-card-row">
                                            <span className="transaction-card-label expenses-card-label">Type:</span>
                                            <span className="transaction-card-value expenses-card-value">{transDetails.type}</span>
                                        </div>
                                        
                                        <div className="transaction-card-description expenses-card-description">
                                            <span className="transaction-card-label expenses-card-label">Description: </span>
                                            <span className="transaction-card-value expenses-card-value">{transDetails.description || transDetails.type}</span>
                                        </div>
                                    </div>
                                                  
                                );
                            })
                        ) : (
                            <p>No expense transactions for this month</p>
                        )}
                        
                        {sortedExpenses.length > 3 && (
                            <button 
                                className="show-more-button"
                                onClick={() => setShowAllExpenses(!showAllExpenses)}
                            >
                                {showAllExpenses 
                                    ? "Show Less" 
                                    : `Show More (${sortedExpenses.length - 3} more)`
                                }
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    }

    // Render the Income Section
    const renderIncomeSection = () => {
        if (incomeByCat === null){
            return null;
        }
        return (
            <div className="finance-form income-form">
                <div className="expenses-title income-title">
                    <h3>Income for {currentMonth}</h3>
                </div>


                <div className="switch-tab-buttons flex flex-wrap justify-center gap-4">
                    <button className="flex items-center justify-center px-4 py-2 text-center" 
                        onClick={() => {setExpenseTab("overall"); setShowAllExpenses(false)}}>
                        <h3>Overall</h3>
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 text-center" 
                        onClick={() => {setExpenseTab("details"); setShowAllExpenses(false)}}>
                        <h3>Details</h3>
                    </button>
                    <button className="track-everything-btn flex items-center justify-center px-4 py-2 text-center"
                        onClick={() => navigateToTrackEverything("income")}>
                        <h3>Track Everything</h3>
                    </button>
                </div>
                
                {incomeTab === "overall" ? (
                    Object.entries(incomeByCat).map(([category, amount], index) => (
                        <div className="income-overview-card" key={index}>
                            <i className={getCategoryIcon(category)}/>
                            <p>{category}: ${amount}</p>
                        </div>
                    ))
                ) : (
                    <>
                        {incomeToShow && incomeToShow.length > 0 ? (
                            incomeToShow.map(([transDate, transDetails], index) => {
                                const timestamp = parseInt(transDate, 10);
                                return (
                                    <div className="transaction-card income-card" key={index}> 
                                        <div className="transaction-card-header">
                                            <p className="transaction-card-date income-card-date">{formatTimestamp(timestamp, "date-only")}</p>
                                            
                                            <div className="transaction-card-actions">
                                                <button 
                                                    className="transaction-edit-btn"
                                                    onClick={() => changeEditEntry(transDate)}
                                                    title="Edit transaction"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    className="transaction-delete-btn"
                                                    onClick={() => deleteEntry(transDate)}
                                                    title="Delete transaction"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="transaction-card-row income-card-row">
                                            <span className="transaction-card-label income-card-label">Category:</span>
                                            <span className="transaction-card-value income-card-value">{transDetails.category}</span>
                                        </div>
                                        
                                        <div className="transaction-card-row income-card-row">
                                            <span className="transaction-card-label income-card-label">Amount:</span>
                                            <span className={`transaction-card-amount income-card-amount income`}>
                                                ${transDetails.amount}
                                            </span>
                                        </div>
                                        
                                        <div className="transaction-card-row income-card-row">
                                            <span className="transaction-card-label income-card-label">Type:</span>
                                            <span className="transaction-card-value income-card-value">{transDetails.type}</span>
                                        </div>
                                        
                                        <div className="transaction-card-description income-card-description">
                                            <span className="transaction-card-label income-card-label">Description: </span>
                                            <span className="transaction-card-value income-card-value">{transDetails.description || transDetails.type}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No income transactions for this month</p>
                        )}
                        
                        {sortedIncome.length > 3 && (
                            <button 
                                className="show-more-button"
                                onClick={() => setShowAllIncome(!showAllIncome)}
                            >
                                {showAllIncome 
                                    ? "Show Less" 
                                    : `Show More (${sortedIncome.length - 3} more)`
                                }
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    }

    // Render the Add Entries Form
    const renderAddEntriesForm = () => {
        return (
            <div className="add-entries">
                <div className="entries-title">
                    <h3>Add Entries</h3>
                </div>
                
                <h3>Transaction Type</h3>
                <select value={transactionType} onChange={(e) => {setTransactionType(e.target.value)}}>
                    <option value="type-base">Transaction type...</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                
                <h3>Transaction Category</h3>
                <select value={transactionCategory} onChange={(e) => {setTransactionCategory(e.target.value)}}>
                    <option value="category-base">Transaction Category...</option>
                    {transactionType === "income" ? (
                        incomeCategories.map((incomeCat, index) => (
                            <option key={index} value={incomeCat}>{incomeCat}</option>
                        ))
                    ) : transactionType === "expense" ? (
                        expenseCategories.map((expenseCat, index) => (
                            <option key={index} value={expenseCat}>{expenseCat}</option>
                        ))
                    ) : null}
                </select>
                
                <h3>Transaction Price</h3>
                <input 
                    type="number" 
                    placeholder="e.g 45.78" 
                    value={transactionCost} 
                    onChange={(e) => {setTransactionCost(e.target.value)}}
                />
                
                <h3>Transaction Description <span className="optional-text">* Not required</span></h3>
                <input 
                    type="text" 
                    placeholder="Movie tickets and snacks" 
                    value={transactionDescription} 
                    onChange={(e) => {setTransactionDescription(e.target.value)}}
                />
                
                <button onClick={handleAddEntry}>
                    <p> Add Entry </p>
                </button>
            </div>
        );
    }

    return(
        <>
            <div className="section-header">
                <i className="fa-solid fa-pencil"/>
                <h2>Start Tracking Today</h2>
            </div>
            
            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    {isEditEntry ? (
                        <EditTransaction 
                            handleCloseModal={handleCloseModal} 
                            transactionID={editingTransaction}
                            transactionData={globalData[editingTransaction]}
                        />
                    ) : (
                        <Authentication handleCloseModal={handleCloseModal}/>
                    )}
                </Modal>
            )}
            
            {(isLoading && isAuthenticated) && (
                <p>Loading...</p>
            )}

            {(isAuthenticated && isData) && (
                <>
                    {renderMonthlySummary()}
                    {renderExpensesSection()}
                    {renderIncomeSection()}
                </>
            )}

            {renderAddEntriesForm()}
        </> 
    )
}