import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatTimestamp } from '../utils';

const TrackEverything = () => {
    const { type } = useParams(); // Gets 'expenses' or 'income' from URL
    const navigate = useNavigate();
    const { globalData, globalUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter all transactions by type (expense or income)
    useEffect(() => {
        if (!globalUser) {
            // Redirect to login if not authenticated
            navigate('/');
            return;
        }
        
        if (globalData) {
            try {
                // Filter transactions by type
                const filtered = Object.entries(globalData).filter(([time, details]) => {
                    if (!details || !details.type) return false;
                    return details.type.toLowerCase() === type.toLowerCase();
                });
                
                // Sort by date (newest first)
                const sorted = filtered.sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
                setTransactions(sorted);
                setIsLoading(false);
            } catch (err) {
                console.error(`Error loading ${type} transactions:`, err);
                setTransactions([]);
                setIsLoading(false);
            }
        }
    }, [globalData, globalUser, type, navigate]);
    
    return (
        <div className="track-everything-container">
            <div className="section-header">
                <i className={type === 'income' ? 'fa-solid fa-money-bill-wave' : 'fa-solid fa-credit-card'} />
                <h2>All {type.charAt(0).toUpperCase() + type.slice(1)} Transactions</h2>
            </div>
            
            <button className="back-button" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
            </button>
            
            {isLoading ? (
                <p>Loading all transactions...</p>
            ) : (
                <div className="all-transactions">
                    {transactions.length > 0 ? (
                        transactions.map(([transDate, transDetails], index) => {
                            const timestamp = parseInt(transDate, 10);
                            return (
                                <div className={`transaction-card ${type}-card`} key={index}>
                                    <div className="transaction-card-header">
                                        <p className={`transaction-card-date ${type}-card-date`}>
                                            {formatTimestamp(timestamp, "full")}
                                        </p>
                                    </div>
                                    
                                    <div className={`transaction-card-row ${type}-card-row`}>
                                        <span className={`transaction-card-label ${type}-card-label`}>Category:</span>
                                        <span className={`transaction-card-value ${type}-card-value`}>
                                            {transDetails.category}
                                        </span>
                                    </div>
                                    
                                    <div className={`transaction-card-row ${type}-card-row`}>
                                        <span className={`transaction-card-label ${type}-card-label`}>Amount:</span>
                                        <span className={`transaction-card-amount ${type}-card-amount ${type}`}>
                                            ${transDetails.amount}
                                        </span>
                                    </div>
                                    
                                    <div className={`transaction-card-description ${type}-card-description`}>
                                        <span className={`transaction-card-label ${type}-card-label`}>Description: </span>
                                        <span className={`transaction-card-value ${type}-card-value`}>
                                            {transDetails.description || transDetails.type}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No {type} transactions found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrackEverything;