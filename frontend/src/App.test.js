import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App component', () => {
    it('renders input fields for name, email, and age correctly', () => {
        render(<App />);
        
        const nameInput = screen.getByPlaceholderText('Name');
        const emailInput = screen.getByPlaceholderText('Email');
        const ageInput = screen.getByPlaceholderText('Age');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(ageInput).toBeInTheDocument();
    });
});

