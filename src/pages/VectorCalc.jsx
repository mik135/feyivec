import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Navbar from '../components/Navbar';
import VectorInput from '../components/VectorInput';
import ResultDisplay from '../components/ResultDisplay';
import InfoModal from '../components/InfoModal';

const VectorCalculator = () => {
  const [vectors, setVectors] = useState([
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAxisNumbers, setShowAxisNumbers] = useState(false);
  const axisNumbersRef = useRef([]);
  // Added: State to track pinch-to-zoom
  const pinchZoomRef = useRef({ distance: 0 });////

  useEffect(() => {
    // Show modal on first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsModalOpen(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getTouchDistance = (touches) => {
    const [touch1, touch2] = touches;
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Generate colors dynamically based on the number of vectors
  const generateColor = (index) => {
    const hue = (360 / (vectors.length + 1)) * index;
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`).getHex();
  };

  const resultColor = 0xff44ff;

  const addVector = () => {
    setVectors([...vectors, { x: 0, y: 0, z: 0 }]);
    setResult(null);
  };

  const removeVector = (indexToRemove) => {
    if (vectors.length > 2) {
      setVectors(vectors.filter((_, index) => index !== indexToRemove));
      setResult(null);
    }
  };

  const handleVectorChange = (index, component, value) => {
    const newVectors = [...vectors];
    newVectors[index] = { ...newVectors[index], [component]: value };
    setVectors(newVectors);
    setResult(null);
  };

  const calculateResult = () => {
    const parsedVectors = vectors.map(v => ({
      x: parseFloat(v.x) || 0,
      y: parseFloat(v.y) || 0,
      z: parseFloat(v.z) || 0
    }));

    switch (operation) {
      case 'add':
        return parsedVectors.reduce((acc, curr) => ({
          x: acc.x + curr.x,
          y: acc.y + curr.y,
          z: acc.z + curr.z
        }));
      case 'subtract':
        return parsedVectors.reduce((acc, curr, index) => {
          if (index === 0) return acc;
          return {
            x: acc.x - curr.x,
            y: acc.y - curr.y,
            z: acc.z - curr.z
          };
        }, parsedVectors[0]);
      case 'dot':
        if (vectors.length !== 2) {
          alert('Dot product requires exactly 2 vectors');
          return null;
        }
        const dot = parsedVectors[0].x * parsedVectors[1].x + 
                   parsedVectors[0].y * parsedVectors[1].y + 
                   parsedVectors[0].z * parsedVectors[1].z;
        return { scalar: dot };
      case 'cross':
        if (vectors.length !== 2) {
          alert('Cross product requires exactly 2 vectors');
          return null;
        }
        return {
          x: parsedVectors[0].y * parsedVectors[1].z - parsedVectors[0].z * parsedVectors[1].y,
          y: parsedVectors[0].z * parsedVectors[1].x - parsedVectors[0].x * parsedVectors[1].z,
          z: parsedVectors[0].x * parsedVectors[1].y - parsedVectors[0].y * parsedVectors[1].x
        };
      default:
        return null;
    }
  };

  // THREE.js setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0xf8f9fa);

    // Camera setup
    const aspectRatio = containerRef.current.offsetWidth / containerRef.current.offsetHeight;
    cameraRef.current = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    // Modified: Updated camera position for better view
    cameraRef.current.position.set(10, 10, 10); // Changed from 5, 5, 5
    cameraRef.current.lookAt(0, 0, 0);

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
    containerRef.current.appendChild(rendererRef.current.domElement);

    const createAxisNumbers = () => {
      const numbers = [];

      // Create numbers for each axis (1 to 10)
      for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        // X axis numbers
        const xCanvas = document.createElement('canvas');
        xCanvas.width = 32;
        xCanvas.height = 32;
        const xCtx = xCanvas.getContext('2d');
        xCtx.fillStyle = '#000000';
        xCtx.font = '16px Arial';
        xCtx.textAlign = 'center';
        xCtx.textBaseline = 'middle';
        xCtx.fillText(i.toString(), 16, 16);

        const xTexture = new THREE.CanvasTexture(xCanvas);
        const xMaterial = new THREE.SpriteMaterial({ map: xTexture });
        const xSprite = new THREE.Sprite(xMaterial);
        xSprite.position.set(i, -0.3, 0);
        xSprite.scale.set(0.5, 0.5, 1);
        numbers.push(xSprite);

        // Y axis numbers
        const yCanvas = document.createElement('canvas');
        yCanvas.width = 32;
        yCanvas.height = 32;
        const yCtx = yCanvas.getContext('2d');
        yCtx.fillStyle = '#000000';
        yCtx.font = '16px Arial';
        yCtx.textAlign = 'center';
        yCtx.textBaseline = 'middle';
        yCtx.fillText(i.toString(), 16, 16);

        const yTexture = new THREE.CanvasTexture(yCanvas);
        const yMaterial = new THREE.SpriteMaterial({ map: yTexture });
        const ySprite = new THREE.Sprite(yMaterial);
        ySprite.position.set(-0.3, i, 0);
        ySprite.scale.set(0.5, 0.5, 1);
        numbers.push(ySprite);

        // Z axis numbers
        const zCanvas = document.createElement('canvas');
        zCanvas.width = 32;
        zCanvas.height = 32;
        const zCtx = zCanvas.getContext('2d');
        zCtx.fillStyle = '#000000';
        zCtx.font = '16px Arial';
        zCtx.textAlign = 'center';
        zCtx.textBaseline = 'middle';
        zCtx.fillText(i.toString(), 16, 16);

        const zTexture = new THREE.CanvasTexture(zCanvas);
        const zMaterial = new THREE.SpriteMaterial({ map: zTexture });
        const zSprite = new THREE.Sprite(zMaterial);
        zSprite.position.set(0, -0.3, i);
        zSprite.scale.set(0.5, 0.5, 1);
        numbers.push(zSprite);
      }

      return numbers;
    };

    const axisNumbers = createAxisNumbers();
    axisNumbersRef.current = axisNumbers;
    axisNumbers.forEach(number => {
      number.visible = showAxisNumbers;
      sceneRef.current.add(number);
    });

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

    const xLabel = addAxisLabel(new THREE.Vector3(11, 0, 0), 'X'); // Changed from 5.5 to 11
    const yLabel = addAxisLabel(new THREE.Vector3(0, 11, 0), 'Y'); // Changed from 5.5 to 11
    const zLabel = addAxisLabel(new THREE.Vector3(0, 0, 11), 'Z'); // Changed from 5.5 to 11

    sceneRef.current.add(xLabel);
    sceneRef.current.add(yLabel);
    sceneRef.current.add(zLabel);

    axisLabelsRef.current = [xLabel, yLabel, zLabel];

    // Grid and axes
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.material.linewidth = 2;
    sceneRef.current.add(axesHelper);

    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xdddddd); // Changed size from 10 to 20
    gridHelper.position.set(0, 0, 0); // Added to ensure grid is centered
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    sceneRef.current.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    sceneRef.current.add(directionalLight);

    // Event handlers
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
      if ((distance > 5 || delta > 0) && (distance < 40 || delta < 0)) { // Changed from 2/20 to 5/40
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const radius = cameraRef.current.position.length();
      cameraRef.current.position.x = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
      cameraRef.current.position.y = radius * Math.sin(rotationRef.current.x);
      cameraRef.current.position.z = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
      cameraRef.current.lookAt(0, 0, 0);

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      axisNumbersRef.current.forEach(sprite => {
        sprite.quaternion.copy(cameraRef.current.quaternion);
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Cleanup
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

  // Add effect to handle visibility toggle
  useEffect(() => {
    if (axisNumbersRef.current) {
      axisNumbersRef.current.forEach(number => {
        number.visible = showAxisNumbers;
      });
    }
  }, [showAxisNumbers]);

  // Update vectors in the scene
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
      const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
      if (length > 0) {
        const direction = new THREE.Vector3(vector.x, vector.y, vector.z).normalize();
        const arrow = new THREE.ArrowHelper(
          direction,
          new THREE.Vector3(0, 0, 0),
          length,
          generateColor(index),
          0.2,
          0.1
        );
        sceneRef.current.add(arrow);
      }
    });

    // Add result vector if applicable
    if (result && !result.hasOwnProperty('scalar')) {
      const length = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
      if (length > 0) {
        const direction = new THREE.Vector3(result.x, result.y, result.z).normalize();
        const arrow = new THREE.ArrowHelper(
          direction,
          new THREE.Vector3(0, 0, 0),
          length,
          resultColor,
          0.2,
          0.1
        );
        sceneRef.current.add(arrow);
      }
    }
  }, [vectors, result]);

  const adjustZoom = (factor) => {
    const camera = cameraRef.current;
    const distance = camera.position.length();
    const newDistance = distance * factor;

    // Limit zoom levels
    if (newDistance > 5 && newDistance < 40) {
      camera.position.multiplyScalar(factor);
      camera.lookAt(0, 0, 0); // Ensure the camera remains focused on the origin
    }
  };


  return (
    <>
      <Navbar handleOpenModal={handleOpenModal} />
      <InfoModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <div className="space-y-6 p-6 bg-gray-100 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative">
            <div
              ref={containerRef}
              className="w-full h-96 bg-white rounded-lg shadow-lg"
              style={{ maxWidth: '100%', aspectRatio: '16/9' }}
            />
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <button
                onClick={() => adjustZoom(1.1)} // Zoom Out
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                -
              </button>
              <button
                onClick={() => adjustZoom(0.9)} // Zoom In
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                +
              </button> 
            </div>
            <button
              onClick={() => setShowAxisNumbers(!showAxisNumbers)}
              className="absolute top-4 right-4 px-3 py-1 bg-white/80 hover:bg-white text-gray-800 rounded-md shadow-sm text-sm transition-colors"
            >
              {showAxisNumbers ? 'Hide Numbers' : 'Show Numbers'}
            </button>
            
          </div>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={addVector}
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors"
              >
                Create Vector
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {vectors.map((vector, index) => (
                <div key={index} className="relative bg-white p-4 rounded-lg shadow">
                  <VectorInput
                    index={index}
                    vector={vector}
                    onChange={handleVectorChange}
                    color={generateColor(index)}
                    label={`Vector ${String.fromCharCode(65 + index)}`}
                  />
                  {vectors.length > 2 && (
                    <button
                      onClick={() => removeVector(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow-sm"
              >
                <option value="none">Select Operation</option>
                <option value="add">Add Vectors</option>
                <option value="subtract">Subtract Vectors</option>
                {vectors.length === 2 && (
                  <>
                    <option value="dot">Dot Product</option>
                    <option value="cross">Cross Product</option>
                  </>
                )}
              </select>
              <button
                onClick={() => {
                  const newResult = calculateResult();
                  setResult(newResult);
                }}
                className="px-4 py-2 bg-[#5271ff] text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
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