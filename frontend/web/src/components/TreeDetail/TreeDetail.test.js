import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TreeDetail from "./TreeDetail";

const mockTree = {
    id: 1,
    description: "Een eikenboom.",
    height: 20,
    latitude: 52.379189,
    longitude: 4.899431,
};

describe("TreeDetail Component", () => {
    test("renders without crashing", () => {
        render(<TreeDetail />);
        expect(screen.getByText(/Selecteer een boom om de details te bekijken./i)).toBeInTheDocument();
    });

    test("displays tree details when a tree is selected", () => {
        render(<TreeDetail selectedTree={mockTree} />);
        
        expect(screen.getByText(/Boom #1/i)).toBeInTheDocument();
        expect(screen.getByText(/Een eikenboom./i)).toBeInTheDocument();
        expect(screen.getByText(/20 meter/i)).toBeInTheDocument();
        expect(screen.getByText(/52.379189, 4.899431/i)).toBeInTheDocument();
    });

    test("does not display tree details when no tree is selected", () => {
        render(<TreeDetail selectedTree={null} />);
        expect(screen.getByText(/Selecteer een boom om de details te bekijken./i)).toBeInTheDocument();
    });

    test("calls the onClose function when the close button is clicked", () => {
        const onCloseMock = jest.fn();
        render(<TreeDetail selectedTree={mockTree} onClose={onCloseMock} />);

        const closeButton = screen.getByRole("button");
        fireEvent.click(closeButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    test("displays the correct image sources", () => {
        render(<TreeDetail selectedTree={mockTree} />);
        
        const treeImage = screen.getByAltText("tree");
        const closeButtonImage = screen.getByAltText("Close");

        expect(treeImage).toHaveAttribute("src", "tree-icon.png");
        expect(closeButtonImage).toHaveAttribute("src", "close.png");
    });
});
