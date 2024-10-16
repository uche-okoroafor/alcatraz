import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignalApp = () => {
    const [marketData, setMarketData] = useState([]);
    const [signal, setSignal] = useState(null);
    const [predictions, setPredictions] = useState([]);

    const generateSignal = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/signal/generate', { marketData });
            setSignal(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPredictions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/signal/predictions');
            setPredictions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, []);

    return (
        <div>
            <h1>Signal Generator</h1>
            <button onClick={generateSignal}>Generate Signal</button>

            {signal && (
                <div>
                    <h2>Generated Signal</h2>
                    <p>Type: {signal.signalType}</p>
                    <p>Take Profit: {signal.takeProfit}</p>
                    <p>Stop Loss: {signal.stopLoss}</p>
                </div>
            )}

            <h2>Previous Predictions</h2>
            <ul>
                {predictions.map((pred) => (
                    <li key={pred._id}>
                        {pred.signalType} | TP: {pred.takeProfit} | SL: {pred.stopLoss} | Result: {pred.result || 'pending'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SignalApp;
