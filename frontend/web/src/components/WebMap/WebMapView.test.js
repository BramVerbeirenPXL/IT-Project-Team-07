import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapView from './WebMapView';
import { MemoryRouter } from 'react-router-dom';
import { MapContainer as OriginalMapContainer, TileLayer as OriginalTileLayer } from 'react-leaflet';
import data from '../../../../shared/data';
import TreeDetail from "../TreeDetail/TreeDetail";


const mockTrees = [
    {
        id: 1,
        name: 'Tree A',
        latitude: 50.95306,
        longitude: 5.352692,
        height: 20,
        description: 'Sample description A',
    },
    {
        id: 2,
        name: 'Tree B',
        latitude: 50.95310,
        longitude: 5.352700,
        height: 20,
        description: 'Sample description B',
    },
];

const mockFetchTrees = jest.fn(() => Promise.resolve(mockTrees));
const MapContainer = (props) => (
    <OriginalMapContainer {...props} id="map-container" role="region" aria-label="Map Container" />
);
const TileLayer = (props) => (
    <OriginalTileLayer {...props} id="tile-layer" role="region" aria-label="Tile Layer" />
);
jest.mock('../../../../shared/data', () => ({
    getTrees: jest.fn(),
    deleteTree: jest.fn(),
}));

describe('MapView Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        data.getTrees.mockResolvedValue(mockTrees);
        sessionStorage.setItem('token', 'mock-token');
        fetch.resetMocks();
    });

    test('renders the map container and controls', async () => {
        const comp = render(
            <MemoryRouter>
                <MapView fetchTrees={mockFetchTrees} />
            </MemoryRouter>
        );

        const mapContainer = comp.container.querySelector("#map-container");
        expect(mapContainer).toBeInTheDocument();
    });

    test('renders dynamic markers for trees', async () => {
        render(
            <MemoryRouter>
                <MapView fetchTrees={mockFetchTrees} />
            </MemoryRouter>
        );

        await waitFor(() => {
            // const markers = screen.getAllByAltText(/^dynamic-marker-\d+$/);
            const markers = screen.getByAltText("dynamic-marker-1");
            expect(markers).toBeInTheDocument();
            // expect(markers).toHaveLength(2);
        });


    });

    test('shows tree details when a marker is clicked', async () => {
        render(
            <MemoryRouter>
                <MapView fetchTrees={mockFetchTrees} />
            </MemoryRouter>
        );

        const markers = await screen.findAllByRole('button', { name: /Marker/i });
        fireEvent.click(markers[0]);

        const treeTitle = await screen.findByText(`Boom #${mockTrees[0].id}`);
        const descriptionLabel = await screen.findByText(/Beschrijving:/i);
        const treeDescription = await screen.findByText(/Sample description A/i);
        expect(treeTitle).toBeInTheDocument();
        expect(treeDescription).toBeInTheDocument();
        expect(descriptionLabel).toBeInTheDocument();
    });

    test('hides tree details when close button is clicked', async () => {
        render(
            <MemoryRouter>
                <MapView fetchTrees={mockFetchTrees} />
            </MemoryRouter>
        );

        const markers = await screen.findAllByRole('button', { name: /Marker/i });
        fireEvent.click(markers[0]);
        const treeTitle = await screen.findByText(`Boom #${mockTrees[0].id}`);
        expect(treeTitle).toBeInTheDocument();
        const closeButton = screen.getByRole('button', { name: /Close/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(treeTitle).not.toBeInTheDocument();
        });
    });
    test("removes tree and shows success notification on delete", async () => {
        const mockDeleteTree = jest.fn(() => Promise.resolve({ ok: true }));
        data.deleteTree.mockImplementation(mockDeleteTree);

        render(
            <MemoryRouter>
                <MapView fetchTrees={mockFetchTrees} />
            </MemoryRouter>
        );

        const markers = await screen.findAllByRole("button", { name: /Marker/i });
        fireEvent.click(markers[0]);

        const treeTitle = await screen.findByText(`Boom #${mockTrees[0].id}`);
        expect(treeTitle).toBeInTheDocument();

        const deleteButton = screen.getByAltText("Delete");
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockDeleteTree).toHaveBeenCalledWith(mockTrees[0].id);
        });
        const notification = await screen.findByText(/Succesvol verwijderd!/i);
        expect(notification).toBeInTheDocument();
    });

});
