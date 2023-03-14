import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import theme from '../../global/styles/theme';

import { Register } from '.';

jest.mock('expo-apple-authentication', () => { });

const Providers: React.FC = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('Register Screen', () => {
    it('should be open category modal when user click on button', async () => {
        const { getByTestId } = render(
            <Register />,
            {
                wrapper: Providers
            }
        );

        const categoryModal = await getByTestId('modal-category');
        const buttonCategory = await getByTestId('button-category');
        fireEvent.press(buttonCategory);

        expect(categoryModal.props.visible).toBeFalsy();
    })
})