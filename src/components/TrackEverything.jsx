import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrackEverything = () => {
    const navigate = useNavigate();
    const { globalData, globalUser } = useAuth();

    console.log("Logging global data in the everything tab: ", globalData);

    if (!globalUser) {
        navigate('/');
        return null;
    }

    function formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    }

    const groupedData = Object.entries(globalData).reduce((acc, [timestamp, details]) => {
        const date = new Date(parseInt(timestamp, 10));
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push({
            date: date,
            type: details.type || 'N/A',
            category: details.category || 'N/A',
            description: details.description || 'N/A',
            amount: parseFloat(details.amount) || 0,
        });

        return acc;
    }, {});

    return (
        <div className="min-h-screen w-full p-5 flex flex-col items-center gap-10">
            <div className="flex mb-5 mt-5">
                <button 
                    className="p-2 bg-gray-200 rounded-md"
                    onClick={() => navigate('/')}
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>

            <div className="text-xl font-bold text-center">
                <h2>All Global Data</h2>
                <div className="w-20 h-1 bg-gray-400 mx-auto mt-1"></div>
            </div>

            <div className="w-full overflow-x-auto">
                {Object.entries(groupedData).length > 0 ? (
                    Object.entries(groupedData).map(([monthYear, transactions]) => {
                        transactions.sort((a, b) => a.date - b.date);
                        const monthTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

                        return (
                            <div key={monthYear} className="mb-6">
                                <h2 className="text-lg font-bold bg-gray-800 text-white p-2 rounded-md">{monthYear}</h2>
                                <table className="w-full border border-gray-300 text-white">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="border border-gray-500 px-4 py-2">Timestamp</th>
                                            <th className="border border-gray-500 px-4 py-2">Type</th>
                                            <th className="border border-gray-500 px-4 py-2">Category</th>
                                            <th className="border border-gray-500 px-4 py-2">Description</th>
                                            <th className="border border-gray-500 px-4 py-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((t, index) => (
                                            <tr key={index} className="text-center border-b border-gray-600">
                                                <td className="border border-gray-500 px-4 py-2">{t.date.toLocaleDateString()}</td>
                                                <td className="border border-gray-500 px-4 py-2">{t.type}</td>
                                                <td className="border border-gray-500 px-4 py-2">{t.category}</td>
                                                <td className="border border-gray-500 px-4 py-2">{t.description}</td>
                                                <td className="border border-gray-500 px-4 py-2">{formatCurrency(t.amount)}</td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold bg-gray-800 text-white">
                                            <td colSpan="4" className="text-right px-4 py-2">Total for {monthYear}:</td>
                                            <td className="px-4 py-2">{formatCurrency(monthTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center p-4">No data found.</p>
                )}
            </div>
        </div>
    );
};

export default TrackEverything;