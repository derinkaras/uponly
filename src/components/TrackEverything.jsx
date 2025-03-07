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

    return (
        <div className="track-everything-container min-h-screen p-5 flex flex-col items-center gap-10">
                        {/* Wrap Button in a Flex Container */}
                        <div className="flex mb-5 mt-5">
                <button 
                    className="back-button p-2 bg-gray-200 rounded-md w-fit"
                    onClick={() => navigate('/')}
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>

            <div className="section-header flex items-center gap-2 text-xl font-bold">
                <h2>All Global Data</h2>
            </div>



            <table className="w-full border-collapse border border-gray-300 mt-10">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Timestamp</th>
                        <th className="border border-gray-300 px-4 py-2">Type</th>
                        <th className="border border-gray-300 px-4 py-2">Category</th>
                        <th className="border border-gray-300 px-4 py-2">Description</th>
                        <th className="border border-gray-300 px-4 py-2">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(globalData).length > 0 ? (
                        Object.entries(globalData).map(([timestamp, details], index) => (
                            <tr key={index} className="text-center border-b border-gray-300">
                                <td className="border border-gray-300 px-4 py-2">{new Date(parseInt(timestamp, 10)).toLocaleDateString()}</td>
                                <td className="border border-gray-300 px-4 py-2">{details.type || 'N/A'}</td>
                                <td className="border border-gray-300 px-4 py-2">{details.category || 'N/A'}</td>
                                <td className="border border-gray-300 px-4 py-2">{details.description || 'N/A'}</td>
                                <td className="border border-gray-300 px-4 py-2">${details.amount || '0.00'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center p-4">No data found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TrackEverything;
