
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import data from '../../../../shared/data';
import 'leaflet/dist/leaflet.css';
import Navbar from '../Navbar/Navbar';
import "./WebMapView.css";
import L from 'leaflet';
import PropTypes from 'prop-types';
import DynamicMarker from '../DynamicMarker/DynamicMarker';
import TreeDetail from '../TreeDetail/TreeDetail';
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css';

const layers = [
    {
        name: 'Standaard',
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
        preview: 'https://tile.openstreetmap.org/12/2048/1360.png',
    },
    {
        name: 'Satelliet',
        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        preview: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/12/1360/2048',
    },
    {
        name: 'Fietsen',
        url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=effe903119e1476883987eec6dfc2a5b',
        attribution: '&copy; OpenCycleMap contributors',
        preview: 'https://tile.thunderforest.com/cycle/12/2048/1360.png?apikey=effe903119e1476883987eec6dfc2a5b',
    },
];

const LayerControl = ({ activeLayer, setActiveLayer }) => {
    const map = useMap();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const tileLayer = L.tileLayer(activeLayer.url, {
            attribution: activeLayer.attribution,
        });
        tileLayer.addTo(map);

        return () => {
            map.eachLayer((layer) => {
                if (layer.options.attribution === activeLayer.attribution) {
                    map.removeLayer(layer);
                }
            });
        };
    }, [activeLayer, map]);

    return (
        <div
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
            }}
        >
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                    }}
                >
                    🗺️ Lagen
                </button>
            )}

            {isOpen && (
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        marginTop: '10px',
                        textAlign: 'center',
                    }}
                >
                    {layers.map((layer) => (
                        <div
                            key={layer.name}  // Use unique `name` as key
                            style={{
                                display: 'inline-block',
                                margin: '5px',
                                textAlign: 'center',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setActiveLayer(layer);
                                    setIsOpen(false);
                                }}
                                style={{
                                    backgroundImage: `url(${layer.preview})`,
                                    backgroundSize: 'cover',
                                    width: '60px',
                                    height: '60px',
                                    border: activeLayer.name === layer.name ? '3px solid #4CAF50' : '1px solid #ccc',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                                title={layer.name}
                            />
                            <span
                                style={{
                                    display: 'block',
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#333',
                                }}
                            >
                                {layer.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

LayerControl.propTypes = {
    activeLayer: PropTypes.object.isRequired,
    setActiveLayer: PropTypes.func.isRequired,
};

const MapView = ({ fetchTrees }) => {
    const [trees, setTrees] = useState([]);
    const [activeLayer, setActiveLayer] = useState(layers[0]);
    const [center] = useState([50.95306, 5.352692]);
    const [zoom] = useState(16);
    const [selectedTree, setSelectedTree] = useState(null);

    const fetchTreesData = async () => {
        const fetchedTrees = await data.getTrees();
        setTrees(fetchedTrees);
    };
    useEffect(() => {
        fetchTreesData();
    }, [fetchTrees]);

    const handleTreeSelect = (tree) => {
        setSelectedTree(tree);
    };

    const handleCloseDetail = () => {
        setSelectedTree(null);
    };

    const handleDeleteTree = async () => {
        if(selectedTree){
            const response = await data.deleteTree(selectedTree)
            if(response.ok) {
                Store.addNotification({
                    title: "Succesvol verwijderd!",
                    message: `Boom met ID: ${selectedTree.id} is succesvol verwijderd`,
                    type: "success",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__bounceIn"],
                    animationOut: ["animate__animated", "animate__zoomOut"],
                    dismiss: {
                      duration: 3000,
                      onScreen: true
                    }
                  });
                  handleCloseDetail()
                  fetchTreesData();
            }
        }
    };
    return (
        <div className="layout">
            <ReactNotifications />
            <Navbar />
            <div className={`map-container ${selectedTree ? 'map-container-selected' : ''}`}>
                <div className="map-area">
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        className="leaflet-map"
                        id="map-container"
                    >
                        <LayerControl activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
                        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" id="tile-layer" />
                        {trees.length > 0 && trees.map((tree) => (
                            <DynamicMarker
                                key={tree.id}
                                tree={tree}
                                isSelected={selectedTree?.id === tree.id}
                                onTreeSelect={handleTreeSelect}
                                id={`dynamic-marker-${tree.id}`}
                            />
                        ))}
                    </MapContainer>
                                    
                </div>
                {selectedTree && <TreeDetail selectedTree={selectedTree} onClose={handleCloseDetail} onDelete={handleDeleteTree} id="tree-detail" />}
            </div>
        </div>
    );
};

MapView.propTypes = {
    fetchTrees: PropTypes.func.isRequired, 
};

export default MapView;
