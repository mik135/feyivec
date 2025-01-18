import React from 'react';

const VectorInput = ({ index, vector, onChange, color, label }) => (
  <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg shadow-md border-l-4" style={{ borderLeftColor: `#${color.toString(16)}` }}>
    <div className="flex items-center space-x-2">
      <span className="font-bold text-lg">{label}</span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {['x', 'y', 'z'].map((component) => (
        <div key={component} className="flex flex-col">
          <label className="text-sm text-gray-600">{component.toUpperCase()}</label>
          <input
            type="text"
            inputMode='numeric'
            value={vector[component]}
            onChange={(e) => onChange(index, component, e.target.value)}
            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  </div>
);

export default VectorInput;
