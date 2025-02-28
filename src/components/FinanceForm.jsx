import React, { useEffect, useState } from 'react';
import { 
    // Remove transactionHistory import
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
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
  
export default function FinanceForm(props){
    const { isAuthenticated, isData, isLoading} = props
    const [showModal, setShowModal] = useState(false)
    
    // Global stuff
    const { globalData, setGlobalData, globalUser } = useAuth()
    //console.log("GLOBAL USER: ", globalUser)
    
    // Current month for display
    let currentMonth = new Date().toLocaleString('default', { month: 'long' })
    
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
    
    // Form state for adding entries
    const [transactionType, setTransactionType] = useState("type-base")
    const [transactionCategory, setTransactionCategory] = useState("category-base")
    const [transactionCost, setTransactionCost] = useState("")
    const [transactionDescription, setTransactionDescription] = useState("")
    
    // Derived state
    const expensesToShow = showAllExpenses ? sortedExpenses : sortedExpenses.slice(0, 3);
    const incomeToShow = showAllIncome ? sortedIncome : sortedIncome.slice(0, 3);

    // Update calculated values when globalData changes
    useEffect(() => {
        if (globalData) {
            // Update financial calculations
            setTotalSpending(calculateTotalMonthlySpending(globalData));
            setTotalIncome(calculateTotalMonthlyIncome(globalData));
            setExpenseByCat(getMonthlyExpensesByCategory(globalData));
            setIncomeByCat(getMonthlyIncomeByCategory(globalData));
            
            try {
                // Update sorted transactions
                const expenseTransactions = Object.entries(globalData).filter(([timestamp, transDetails]) => 
                    transDetails.type && transDetails.type.toLowerCase() === 'expense'
                );
                const sortedExpensesData = expenseTransactions.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
                setSortedExpenses(sortedExpensesData);
                
                // Extract and sort income transactions
                const incomeTransactions = Object.entries(globalData).filter(([timestamp, transDetails]) => 
                    transDetails.type && transDetails.type.toLowerCase() === 'income'
                );
                const sortedIncomeData = incomeTransactions.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
                setSortedIncome(sortedIncomeData);
            } catch (err) {
                console.error("Error sorting transactions:", err);
                setSortedExpenses([]);
                setSortedIncome([]);
            }
        }
    }, [globalData]); // Only re-run when globalData changes

    // Add new transaction entry
    async function addEntry(category, amount, type, description, callback) {
        // Validate inputs
        if (!category || !amount || !type || category === "category-base" || type === "type-base") {
            alert("Please fill in all required fields");
            return;
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const timestamp = createTimestamp(year, month, day, hour, minutes);
        
        // Convert amount to number
        const numericAmount = parseFloat(amount);
        
        try {
            const newData = {           
                "category": category,
                "amount": numericAmount,
                "type": type,
                "description": description || type
            }
    
            // First operation - update local state
            const newGlobalData = {...(globalData || {})}
            newGlobalData[timestamp] = newData
            setGlobalData(newGlobalData)
            console.log(timestamp, category, numericAmount, type, description)
    
            // Second operation - update firebase
            if (globalUser) {
                const userRef = doc(db, 'users', globalUser.uid)
                await setDoc(userRef, {
                    [timestamp]: newData
                }, {merge: true})
            }
            
            // Call the callback to refresh data and reset form
            if (callback) callback();
            
        } catch (err) {
            console.log(err.message)
        }
    }
    
    // Form submission handler
    const handleAddEntry = () => {
        if (!isAuthenticated){
            setShowModal(true)
            return
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
                
                // No need to manually update states here as the 
                // useEffect will handle that when globalData changes
            }
        );
    }

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

                <div className="switch-tab-buttons">
                    <button onClick={() => {setExpenseTab("overall"); setShowAllExpenses(false)}}>
                        <h3>Overall</h3>
                    </button>
                    <button onClick={() => {setExpenseTab("details"); setShowAllExpenses(false)}}>
                        <h3>Details</h3>
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
                        {expensesToShow.map(([transDate, transDetails], index) => {
                            const timestamp = parseInt(transDate, 10);
                            return (
                                <div className="transaction-card expenses-card" key={index}> 
                                    <p className="transaction-card-date expenses-card-date">{formatTimestamp(timestamp, "date-only")}</p>
                                    
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
                        })}
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
        if (incomeByCat === null ){
            return null;
        }
        return (
            <div className="finance-form income-form">
                <div className="expenses-title income-title">
                    <h3>Income for {currentMonth}</h3>
                </div>

                <div className="switch-tab-buttons">
                    <button onClick={() => {setIncomeTab("overall"); setShowAllIncome(false)}}>
                        <h3>Overall</h3>
                    </button>
                    <button onClick={() => {setIncomeTab("details"); setShowAllIncome(false)}}>
                        <h3>Details</h3>
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
                        {incomeToShow.map(([transDate, transDetails], index) => {
                            const timestamp = parseInt(transDate, 10);
                            return (
                                <div className="transaction-card income-card" key={index}> 
                                    <p className="transaction-card-date income-card-date">{formatTimestamp(timestamp, "date-only")}</p>
                                    
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
                        })}
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
    
    
    function handleCloseModal(){
        setShowModal(false)
    }

    return(
        <>
            <div className="section-header">
                <i className="fa-solid fa-pencil"/>
                <h2>Start Tracking Today</h2>
            </div>
            {showModal && (<Modal handleCloseModal = {handleCloseModal}>
                <Authentication handleCloseModal = {handleCloseModal}/>
            </Modal>)}
            
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