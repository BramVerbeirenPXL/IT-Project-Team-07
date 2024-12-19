import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TreeDetail.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';

const TreeDetail = ({ selectedTree, onClose, onDelete, onUpdate, isAuthenticated }) => {
    const [editableTree, setEditableTree] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (selectedTree) {
            setEditableTree({ ...selectedTree });
            setIsModified(false);
        }
    }, [selectedTree]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableTree((prevTree) => ({
            ...prevTree,
            [name]: name === 'height' ? parseFloat(value) : value,
        }));
        setIsModified(true);
    };

    const handleSave = () => {
        if (editableTree) {
            onUpdate(editableTree);
            setIsModified(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="content">
                    <button onClick={onClose} className="close-button">
                        <img
                            style={{ width: "30px", height: "30px" }}
                            src="close.png"
                            alt="Close"
                        />
                    </button>
                    {isAuthenticated && (
                        <button onClick={handleClickOpen} className="delete-button">
                            <img
                                style={{ width: "35px", height: "35px" }}
                                src="delete.png"
                                alt="Delete"
                            />
                        </button>
                    )}
                    <img
                        src="tree-icon.png"
                        alt="tree"
                        className="tree-image"
                    />
                    {selectedTree ? (
                        <div className="tree-info">
                            <div className="tree-title">
                                <h2>Boom #{selectedTree.id}</h2>
                            </div>
                            <div className="details">
                                <h3>Data:</h3>
                                {isAuthenticated ? (
                                    <>
                                        <p><strong>Beschrijving:</strong> {selectedTree.description ? selectedTree.description : 'N.v.t'}</p>
                                        <p>
                                            <strong>Hoogte:</strong>
                                            <input
                                                type="number"
                                                name="height"
                                                value={editableTree?.height || ''}
                                                onChange={handleInputChange}
                                            />{" "}
                                            meter
                                        </p>
                                        <p>
                                            <strong>Diameter:</strong>
                                            <input
                                                type="number"
                                                name="diameter"
                                                value={editableTree?.diameter || ''}
                                                onChange={handleInputChange}
                                            />{" "}
                                            centimeter
                                        </p>
                                        <p><strong>Coördinaten:</strong> {selectedTree.latitude}, {selectedTree.longitude}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Beschrijving:</strong> {selectedTree.description ? selectedTree.description : 'N.v.t'}</p>
                                        <p><strong>Hoogte:</strong> {selectedTree.height ? selectedTree.height : '0'} meter</p>
                                        <p><strong>Diameter:</strong> {selectedTree.diameter ? selectedTree.diameter : '0'} centimeter</p>
                                        <p><strong>Coördinaten:</strong> {selectedTree.latitude}, {selectedTree.longitude}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p>Selecteer een boom om de details te bekijken.</p>
                    )}
                    {/* Opslaan-knop */}
                    {isModified && (
                        <button onClick={handleSave} className="save-button">
                            Opslaan
                        </button>
                    )}
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            <p style={{color:"", fontWeight:"bold"}}>Boom #{selectedTree.id} verwijderen?</p>
                        </DialogTitle>
                        <DialogActions>
                            <Button onClick={onDelete}>Ja</Button>
                            <Button onClick={handleClose} autoFocus>Nee</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

TreeDetail.propTypes = {
    selectedTree: PropTypes.shape({
        id: PropTypes.number.isRequired,
        description: PropTypes.string,
        height: PropTypes.number.isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
    }),
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

TreeDetail.defaultProps = {
    selectedTree: null,
};

export default TreeDetail;
