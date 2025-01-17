import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold">
              FeyiVec
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 py-6">
              <h3 className='px-4'>Built in honour of my queen - Her Majesty, <b>Feyisewa</b> by her liege - The Brave One.</h3>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 py-8">
          <h3 className='px-4'>Built in honour of my queen - Her Majesty, <b>Feyisewa</b> by her liege - The Brave One.</h3>
        </div>
      )}
    </nav>
  );
};



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
            type="number"
            value={vector[component]}
            onChange={(e) => onChange(index, component, parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  </div>
);

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

const VectorCalculator = () => {
  const [vectors, setVectors] = useState([
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }
  ]);

  const [operation, setOperation] = useState('none');
  const [result, setResult] = useState(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const axisLabelsRef = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const colors = [0xff4444, 0x44ff44];  // Brighter, more distinct colors
  const resultColor = 0xff44ff;
  const vectorLabels = ['Vector A', 'Vector B'];

  const handleVectorChange = (index, component, value) => {
    const newVectors = [...vectors];
    newVectors[index] = { ...newVectors[index], [component]: value };
    setVectors(newVectors);
    setResult(null);
  };

  const calculateResult = () => {
    switch (operation) {
      case 'add':
        return {
          x: vectors[0].x + vectors[1].x,
          y: vectors[0].y + vectors[1].y,
          z: vectors[0].z + vectors[1].z
        };
      case 'subtract':
        return {
          x: vectors[0].x - vectors[1].x,
          y: vectors[0].y - vectors[1].y,
          z: vectors[0].z - vectors[1].z
        };
      case 'dot':
        const dot = vectors[0].x * vectors[1].x + 
                   vectors[0].y * vectors[1].y + 
                   vectors[0].z * vectors[1].z;
        return { scalar: dot };
      case 'cross':
        return {
          x: vectors[0].y * vectors[1].z - vectors[0].z * vectors[1].y,
          y: vectors[0].z * vectors[1].x - vectors[0].x * vectors[1].z,
          z: vectors[0].x * vectors[1].y - vectors[0].y * vectors[1].x
        };
      default:
        return null;
    }
  };

  const handleCalculate = () => {
    const newResult = calculateResult();
    setResult(newResult);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0xf8f9fa);

    const aspectRatio = containerRef.current.offsetWidth / containerRef.current.offsetHeight;
    cameraRef.current = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    cameraRef.current.position.set(5, 5, 5);
    cameraRef.current.lookAt(0, 0, 0);

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Add axis labels
    const addAxisLabel = (position, text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 32, 16);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(1, 0.5, 1);
      return sprite;
    };

    const xLabel = addAxisLabel(new THREE.Vector3(5.5, 0, 0), 'X');
    const yLabel = addAxisLabel(new THREE.Vector3(0, 5.5, 0), 'Y');
    const zLabel = addAxisLabel(new THREE.Vector3(0, 0, 5.5), 'Z');

    sceneRef.current.add(xLabel);
    sceneRef.current.add(yLabel);
    sceneRef.current.add(zLabel);

    axisLabelsRef.current = [xLabel, yLabel, zLabel];

    // Enhanced grid and axes
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.material.linewidth = 2;
    sceneRef.current.add(axesHelper);

    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xdddddd);
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    sceneRef.current.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    sceneRef.current.add(directionalLight);

    const handlePointerDown = (event) => {
      isDraggingRef.current = true;
      const x = event.touches ? event.touches[0].clientX : event.clientX;
      const y = event.touches ? event.touches[0].clientY : event.clientY;
      startRef.current = { x, y };
    };

    const handlePointerMove = (event) => {
      if (!isDraggingRef.current) return;

      const x = event.touches ? event.touches[0].clientX : event.clientX;
      const y = event.touches ? event.touches[0].clientY : event.clientY;

      const deltaX = x - startRef.current.x;
      const deltaY = y - startRef.current.y;

      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;

      startRef.current = { x, y };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event) => {
      const delta = event.deltaY * 0.001;
      const distance = cameraRef.current.position.length();
      if ((distance > 2 || delta > 0) && (distance < 20 || delta < 0)) {
        cameraRef.current.position.multiplyScalar(1 + delta);
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown);
    canvas.addEventListener('touchmove', handlePointerMove);
    canvas.addEventListener('touchend', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel);

    const animate = () => {
      requestAnimationFrame(animate);

      const radius = cameraRef.current.position.length();
      cameraRef.current.position.x = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
      cameraRef.current.position.y = radius * Math.sin(rotationRef.current.x);
      cameraRef.current.position.z = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
      cameraRef.current.lookAt(0, 0, 0);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous vectors
    sceneRef.current.children = sceneRef.current.children.filter(
      (child) =>
        child instanceof THREE.AmbientLight ||
        child instanceof THREE.DirectionalLight ||
        child instanceof THREE.AxesHelper ||
        child instanceof THREE.GridHelper ||
        child instanceof THREE.Sprite
    );

    // Add vector arrows
    vectors.forEach((vector, index) => {
      const direction = new THREE.Vector3(vector.x, vector.y, vector.z).normalize();
      const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
      const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), length, colors[index], 0.2, 0.1);
      sceneRef.current.add(arrow);
    });

    // Add result vector if applicable
    if (result && !result.hasOwnProperty('scalar')) {
      const direction = new THREE.Vector3(result.x, result.y, result.z).normalize();
      const length = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
      const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), length, resultColor, 0.2, 0.1);
      sceneRef.current.add(arrow);
    }
  }, [vectors, result]);

  return (
    <>
      <Navbar />
    
    <div className="space-y-6 p-6 bg-gray-100 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div
            ref={containerRef}
            className="w-full h-96 bg-white rounded-lg shadow-lg"
            style={{ maxWidth: '100%', aspectRatio: '16/9' }}
          />
        </div>
        <div className="space-y-4">
          {vectors.map((vector, index) => (
            <VectorInput
              key={index}
              index={index}
              vector={vector}
              onChange={handleVectorChange}
              color={colors[index]}
              label={vectorLabels[index]}
            />
          ))}
          <div className="flex flex-col space-y-2">
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="px-4 py-2 border rounded-lg shadow-sm"
            >
              <option value="none">Select Operation</option>
              <option value="add">Add Vectors</option>
              <option value="subtract">Subtract Vectors</option>
              <option value="dot">Dot Product</option>
              <option value="cross">Cross Product</option>
            </select>
            <button
              onClick={handleCalculate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
            >
              Calculate
            </button>
          </div>
          {result && <ResultDisplay result={result} operation={operation} />}
        </div>
      </div>
    </div>
    </>
  );
};

export default VectorCalculator;