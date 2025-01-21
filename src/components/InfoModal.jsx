import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
        <h2 className="text-xl font-bold mb-4">Welcome to <i>feyvec</i> - A simple vector calculator</h2>
        <p className="mb-4">
          This app allows you to perform operations like addition, subtraction, dot product, 
          and cross product on 3D vectors. Here's a quick guide:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Vector colors represent different vectors (e.g., red for Vector A, green for Vector B).</li>
          <li>Click and drag on the graph to rotate the view.</li>
          <li>Use the dropdown to select an operation and calculate results.</li>
        </ul>
        <p className="mb-4">Upcoming features include advanced vector operations and better visualization.</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
