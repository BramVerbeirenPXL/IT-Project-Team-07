import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../../../shared/data';
import Navbar from './Navbar/Navbar';

function UploadView() {
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // Tokenverificatie bij component-mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        return navigate("/");
      }

      try {
        const baseUrl = process.env.REACT_APP_EXTERNAL_IP || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/verify-token/${token}`, {
          method: "GET",
        });

        if (!response.ok) {
          navigate("/");
        }
      } catch (error) {
        console.error("Tokenverificatie mislukt: ", error);
        navigate("/");
      }
    };

    verifyToken();
  }, [navigate]);

  // Bestandsvalidatie en verwerking
  const handleFile = (file) => {
    setErrors([]);
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const response = JSON.parse(event.target.result);

          if (Array.isArray(response)) {
            const newErrors = [];
            const validTrees = response.filter((tree, index) => {
              const treeErrors = [];

              if (!tree.name) {
                treeErrors.push(`Boom met index ${index}: Naam ontbreekt.`);
              }
              if (
                !tree.position ||
                !Array.isArray(tree.position) ||
                tree.position.length !== 2 ||
                typeof tree.position[0] !== 'number' ||
                typeof tree.position[1] !== 'number'
              ) {
                treeErrors.push(`Boom met index ${index}: De positie ontbreekt of is ongeldig..`);
              }
              if (!tree.description) {
                treeErrors.push(`Boom met index ${index}: Beschrijving ontbreekt.`);
              }

              if (treeErrors.length > 0) {
                newErrors.push(...treeErrors);
                return false;
              }
              return true;
            });

            setErrors(newErrors);

            if (validTrees.length > 0) {
              validTrees.forEach(tree => {
                const [latitude, longitude] = tree.position;
                data.addTree({
                  name: tree.name,
                  description: tree.description || 'Geen beschrijving opgegeven',
                  latitude,
                  longitude,
                });
              });
              navigate('/map');
            } else if (newErrors.length === 0) {
              setErrors(['Het JSON-bestand bevat geen geldige bomen.']);
            }
          }
        } catch (err) {
          setErrors(['Er is een fout opgetreden bij het lezen van het JSON-bestand.']);
        }
      };
      reader.readAsText(file);
    } else {
      setErrors(['Selecteer een geldig JSON-bestand.']);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={{
      backgroundColor: "#f0eee4", 
      height: "100vh",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          style={{
            border: '10px dashed #cccccc',
            padding: '50px',
            textAlign: 'center',
            borderRadius: '8px',
            color: '#777',
            width: "50%",
            height: "50%",
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p>Sleep je JSON-bestand hierheen of</p>
          <label style={{ cursor: 'pointer', color: '#007bff' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            klik om een bestand te selecteren
          </label>

          {errors.length > 0 && (
            <ul style={{ color: 'red', textAlign: 'left', overflowX: 'auto' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadView;
