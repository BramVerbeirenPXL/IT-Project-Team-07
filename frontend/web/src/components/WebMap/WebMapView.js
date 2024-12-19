import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Circle, useMapEvents } from 'react-leaflet';
import data from '../../../../shared/data';
import 'leaflet/dist/leaflet.css';
import Navbar from '../Navbar/Navbar';
import "./WebMapView.css";
import L from 'leaflet';
import PropTypes from 'prop-types';
import DynamicMarker from '../DynamicMarker/DynamicMarker';
import TreeDetail from '../TreeDetail/TreeDetail';
import TreeList from '../TreeList/TreeList';
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css';

const layers = [
    {
        name: 'Standaard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        preview: 'https://tile.openstreetmap.org/12/2048/1360.png',
    },
    {
        name: 'Satelliet',
        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        preview: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/12/1360/2048',
    },
    {
        name: 'Fietsen',
        url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=effe903119e1476883987eec6dfc2a5b',
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

const MapEvents = ({ onClick }) => {
    useMapEvents({
        click: (e) => {
            onClick(e);
        },
    });
    return null;
};


const MapView = ({ fetchTrees, refresh }) => {
    const [trees, setTrees] = useState([]);
    const [activeLayer, setActiveLayer] = useState(layers[0]);
    const [center] = useState([50.95306, 5.352692]);
    const [zoom] = useState(16);
    const [selectedTree, setSelectedTree] = useState(null);
    const [clickPosition, setClickPosition] = useState(null);
    const [treesInCircle, setTreesInCircle] = useState([]);
    const [radius, setRadius] = useState(100);
    const [selectedTreeFromList, setSelectedTreeFromList] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const mapRef = useRef();


    const fetchTreesData = async () => {
        const fetchedTrees = await data.getTrees();
        if (sessionStorage.getItem("token")) {setIsAuthenticated(true)};
        setTrees(fetchedTrees);
    };
    useEffect(() => {
        fetchTreesData();        
    }, [fetchTrees, refresh]);


    const handleTreeSelect = (tree) => {
        setSelectedTree(tree);
        setTreesInCircle([]);
        setClickPosition(null);
        setSelectedTreeFromList(null);
    };

    const handleTreeListSelect = (tree) => {
        setSelectedTreeFromList(tree);
    };

    const handleCloseDetail = () => {
        setSelectedTree(null);
        setTreesInCircle([]);
        setClickPosition(null);
    };

    const handleMapClick = (e) => {
        const clickedPoint = e.latlng;
        setClickPosition(clickedPoint);
        setSelectedTree(null);

        const treesWithin = trees.filter(tree => {
            const treeLatLng = L.latLng(tree.latitude, tree.longitude);
            return clickedPoint.distanceTo(treeLatLng) <= radius;
        });

        setTreesInCircle(treesWithin);
        if (treesWithin.length > 0) {
            setSelectedTree(null);
        }
    };

    const handleRadiusChange = (event, newValue) => {
        setRadius(newValue);
        if (clickPosition) {
            handleMapClick({ latlng: clickPosition });
        }
    };

    const handleDeleteTree = async () => {
        const token = sessionStorage.getItem('token');
        
        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        if (selectedTree) {
            const response = await data.deleteTree(selectedTree.id, token)

            if (response.ok) {
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

    const handleUpdateTree = async (updatedTree) => {      
        const token = sessionStorage.getItem('token');
        
        if (!token) {
            console.error("No authentication token found.");
            return;
        }
    
        try {
            const response = await data.updateTree(updatedTree, token);
            console.log(response);
            
            if (response.ok) {
                Store.addNotification({
                    title: "Succesvol geüpdatet!",
                    message: `Boom met ID: ${updatedTree.id} is succesvol geüpdatet.`,
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
                fetchTreesData(); 
            } else {
                const errorData = await response.json();
                console.error("Error updating tree:", errorData);
                Store.addNotification({
                    title: "Update mislukt",
                    message: `Kon boom met ID: ${updatedTree.id} niet updaten.`,
                    type: "danger",
                    insert: "top",
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__shakeX"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 3000,
                        onScreen: true
                    }
                });
            }
        } catch (error) {
            console.error("Error in handleUpdateTree:", error);
        }
    };    

    return (
        <div className="layout">
            <ReactNotifications/>
            <Navbar />
            <div className={`map-container ${selectedTree || clickPosition ? 'map-container-selected' : ''}`}>
                <div className="map-area">
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        className="leaflet-map"
                        id="map-container"
                        ref={mapRef}
                    >
                        <LayerControl activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" id="tile-layer" />
                        <MapEvents onClick={handleMapClick} />
                        {trees.length > 0 && trees.map((tree) => (
                            <DynamicMarker
                                key={tree.id}
                                tree={tree}
                                isSelected={selectedTree?.id === tree.id}
                                selectedTreeFromList={selectedTreeFromList}
                                onTreeSelect={handleTreeSelect}
                                id={`dynamic-marker-${tree.id}`}
                            />
                        ))}
                        {clickPosition && (
                            <Circle
                                center={clickPosition}
                                radius={radius}
                                pathOptions={{ fillColor: '#0597ff', fillOpacity: 0.1, color: '#0597ff' }}
                            />
                        )}
                    </MapContainer>

                </div>
                {selectedTree && <TreeDetail selectedTree={selectedTree} onClose={handleCloseDetail} onDelete={handleDeleteTree} onUpdate={handleUpdateTree} isAuthenticated={isAuthenticated} id="tree-detail" />}
                {clickPosition && (
                    <TreeList
                        treeList={treesInCircle}
                        onClose={handleCloseDetail}
                        radius={radius}
                        onRadiusChange={handleRadiusChange}
                        selectedTreeFromList={selectedTreeFromList}
                        onTreeListSelect={handleTreeListSelect}
                        onTreeDetailSelect={handleTreeSelect}
                    />
                )}
            </div>
        </div>
    );
};
MapView.propTypes = {
    fetchTrees: PropTypes.func.isRequired,
    refresh: PropTypes.func.isRequired
};
MapEvents.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default MapView;
