// Helper function to get appropriate icon for each category
export function getCategoryIcon(category) {
    // Map categories to Font Awesome icons
    const categoryIcons = {
        // Expense Categories
        "Housing": "fa-solid fa-home",
        "Utilities": "fa-solid fa-bolt",
        "Groceries": "fa-solid fa-shopping-cart",
        "Transportation": "fa-solid fa-car",
        "Healthcare": "fa-solid fa-medkit",
        "Entertainment": "fa-solid fa-film",
        "Dining Out": "fa-solid fa-utensils",
        "Shopping": "fa-solid fa-shopping-bag",
        "Insurance": "fa-solid fa-shield-alt",
        "Savings": "fa-solid fa-piggy-bank",
        "Miscellaneous": "fa-solid fa-question-circle",
        
        // Income Categories
        "Salary": "fa-solid fa-money-bill-wave",
        "Freelance": "fa-solid fa-laptop",
        "Investments": "fa-solid fa-chart-line",
        "Rental Income": "fa-solid fa-key",
        "Side Business": "fa-solid fa-store",
        "Other Income": "fa-solid fa-plus-circle"
    };
    
    return categoryIcons[category] || "fa-solid fa-receipt";
}

export const budgetStatusLevels = {
    good: {
        color: "#047857",
        background: "#d1fae5",
        description: 'Spending is well within budget. Keep up the good financial habits!',
        threshold: 0.7  // 0% to 70% of budget used
    },
    warning: {
        color: '#b45309',
        background: "#fef3c7",
        description: 'Approaching budget limits. Consider reviewing non-essential expenses.',
        threshold: 0.9  // 70% to 90% of budget used
    },
    critical: {
        color: "#e11d48",
        background: "#ffe4e6",
        description: 'Over or near budget limit. Immediate review of spending recommended.',
        threshold: 1.0  // 90% to 100%+ of budget used
    }
}

// Helper function to create a timestamp for a specific date in UTC, would output something like 1678888200000
export function createTimestamp(year, month, day, hour = 0, minute = 0, seconds=0) {
    // Note: month is 0-indexed (0 = January, 11 = December)
    return new Date(year, month - 1, day, hour, minute, seconds).getTime();
}


// Convert timestamp back to a readable date string
export function formatTimestamp(timestamp, format = 'full') {
    const date = new Date(timestamp);
    
    // Get date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Add 1 since getMonth() is 0-indexed
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Add leading zeros as needed
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    // Different format options
    switch (format) {
      case 'date-only':
        return `${year}-${formattedMonth}-${formattedDay}`;
      case 'time-only':
        return `${formattedHours}:${formattedMinutes}`;
      case 'short':
        return `${formattedMonth}/${formattedDay}/${year}`;
      case 'full':
      default:
        return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}`;
    }
  }



// Transaction history with UTC timestamp keys (in milliseconds)
export let transactionHistory = {
    // February 21, 2025 at 10:00 AM
    [createTimestamp(2025, 2, 21, 10, 0)]: { 
        "category": "Groceries",
        "amount": 156.52,
        "type": "expense",
        "description": "Weekly grocery shopping"
    },
    // February 22, 2025 at 9:30 AM
    [createTimestamp(2025, 2, 22, 9, 30)]: { 
        "category": "Salary",
        "amount": 3200.00,
        "type": "income",
        "description": "Monthly salary deposit"
    },
    // February 23, 2025 at 2:15 PM
    [createTimestamp(2025, 2, 23, 14, 15)]: { 
        "category": "Entertainment",
        "amount": 45.99,
        "type": "expense",
        "description": "Movie tickets and snacks"
    },
    // February 23, 2025 at 7:45 PM (same day, different time)
    [createTimestamp(2025, 2, 23, 19, 45)]: { 
        "category": "Entertainment",
        "amount": 29.99,
        "type": "expense",
        "description": "Streaming service subscription"
    },
    [createTimestamp(2025, 2, 23, 19, 46)]: { 
        "category": "Entertainment",
        "amount": 29.99,
        "type": "expense",
        "description": "Streaming service subscription"
    },
    [createTimestamp(2025, 2, 23, 19, 47)]: { 
        "category": "Entertainment",
        "amount": 29.99,
        "type": "expense",
        "description": "Streaming service subscription"
    }
}

export let userMonthlyBudget = 2000



export const expenseCategories = [
    "Housing",
    "Utilities",
    "Groceries", 
    "Transportation",
    "Healthcare", 
    "Entertainment", 
    "Dining Out",
    "Shopping", 
    "Insurance", 
    "Savings", 
    "Miscellaneous"
]

export const incomeCategories = [
    "Salary",
    "Freelance",
    "Investments",
    "Rental Income",
    "Side Business",
    "Other Income"
]

export function calculateTotalMonthlySpending(transactionHistory) {
    let spending = 0
    const now = new Date()  
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const [timestamp, transaction] of Object.entries(transactionHistory)) {
        const transactionDate = new Date(parseInt(timestamp))
        
        if (transaction.type === "expense" && 
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear) {
            spending += transaction.amount
        }
    }
    return spending.toFixed(2)
}

export function calculateTotalMonthlyIncome(transactionHistory) {
    let income = 0
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const [timestamp, transaction] of Object.entries(transactionHistory)) {
        const transactionDate = new Date(parseInt(timestamp))
        
        if (transaction.type === "income" &&  
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear) {
            income += transaction.amount
        }
    }
    return income.toFixed(2)
}

export function getMonthlyExpensesByCategory(transactionHistory) {
    let spendingCategories = {
        "Housing": 0,
        "Utilities": 0,
        "Groceries": 0,
        "Transportation": 0,
        "Healthcare": 0,
        "Entertainment": 0,
        "Dining Out": 0,
        "Shopping": 0,
        "Insurance": 0,
        "Savings": 0,
        "Miscellaneous": 0
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const [timestamp, transaction] of Object.entries(transactionHistory)) {
        const transactionDate = new Date(parseInt(timestamp))

        if (transaction.type === "expense" &&  
            transactionDate.getMonth() === currentMonth && 
            transactionDate.getFullYear() === currentYear &&
            spendingCategories.hasOwnProperty(transaction.category)) {
                spendingCategories[transaction.category] += transaction.amount
        }
    }

    let formattedSpendingCategories = {}
    for (const [category, amount] of Object.entries(spendingCategories)){
        formattedSpendingCategories[category] = amount.toFixed(2)
    }
    return formattedSpendingCategories
}

export function getMonthlyIncomeByCategory(transactionHistory) {
    let incomeCategories = {
        "Salary": 0,
        "Freelance": 0,
        "Investments": 0,
        "Rental Income": 0,
        "Side Business": 0,
        "Other Income": 0
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (const [timestamp, transaction] of Object.entries(transactionHistory)) {
        const transactionDate = new Date(parseInt(timestamp))

        if (transaction.type === "income" &&  
            transactionDate.getMonth() === currentMonth && 
            transactionDate.getFullYear() === currentYear &&
            incomeCategories.hasOwnProperty(transaction.category)) {
                incomeCategories[transaction.category] += transaction.amount
        }
    }

    let formattedIncomeCategories = {}
    for (const [category, amount] of Object.entries(incomeCategories)){
        formattedIncomeCategories[category] = amount.toFixed(2)
    }
    return formattedIncomeCategories
}