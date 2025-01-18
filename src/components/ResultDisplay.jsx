import React from 'react';

const ResultDisplay = ({ result, operation }) => {
  if (!result) return null;

  const formatVector = (vector) => {
    if (!vector) return '';
    return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(2)})`;
  };

  const getResultText = () => {
    if (result.hasOwnProperty('scalar')) {
      return `${result.scalar.toFixed(2)}`;
    }
    return formatVector(result);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
      <h3 className="font-bold text-lg mb-2">Result: {operation}</h3>
      <p className="text-xl font-mono">{getResultText()}</p>
    </div>
  );
};

export default ResultDisplay;