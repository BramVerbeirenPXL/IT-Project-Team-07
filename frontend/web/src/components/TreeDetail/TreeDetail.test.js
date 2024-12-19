import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TreeDetail from './TreeDetail';

const mockSelectedTree = {
  id: 1,
  description: 'Test Tree',
  height: 10,
  diameter: 50,
  latitude: 52.3676,
  longitude: 4.9041,
};

const mockOnClose = jest.fn();
const mockOnDelete = jest.fn();
const mockOnUpdate = jest.fn();

describe('TreeDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={false} />);
    expect(screen.getByText(/Boom #1/i)).toBeInTheDocument();
  });

  test('displays tree information correctly', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={false} />);
    expect(screen.getByText(/Test Tree/i)).toBeInTheDocument();
    expect(screen.getByText(/10 meter/i)).toBeInTheDocument();
    expect(screen.getByText(/50 centimeter/i)).toBeInTheDocument();
    expect(screen.getByText(/52.3676, 4.9041/i)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={false} />);
    fireEvent.click(screen.getByAltText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows delete button when authenticated', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={true} />);
    expect(screen.getByAltText('Delete')).toBeInTheDocument();
  });

  test('does not show delete button when not authenticated', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={false} />);
    expect(screen.queryByAltText('Delete')).not.toBeInTheDocument();
  });

  test('opens delete confirmation dialog when delete button is clicked', async () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={true} />);
    fireEvent.click(screen.getByAltText('Delete'));
    expect(await screen.findByText(/Boom #1 verwijderen?/i)).toBeInTheDocument();
  });

  test('calls onDelete when confirmation is given', async () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={true} />);
    fireEvent.click(screen.getByAltText('Delete'));
    fireEvent.click(await screen.findByText('Ja'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('allows editing of tree details when authenticated', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={true} />);
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  test('does not allow editing of tree details when not authenticated', () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={false} />);
    expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('50')).not.toBeInTheDocument();
  });

  test('calls onUpdate when save button is clicked', async () => {
    render(<TreeDetail selectedTree={mockSelectedTree} onClose={mockOnClose} onDelete={mockOnDelete} onUpdate={mockOnUpdate} isAuthenticated={true} />);
    const heightInput = screen.getByDisplayValue('10');
    fireEvent.change(heightInput, { target: { value: '15' } });
    fireEvent.click(screen.getByText('Opslaan'));
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ height: 15 }));
  });
});
