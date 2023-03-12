import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from "./auth"

// coloquei esse jest para sair de um erro
jest.mock('expo-apple-authentication', () => { });

describe('Auth Hook', () => {
    it('should be able to sign in with Google account existing', async () => {
        // Por volta do useAuth() é passado o AuthProvider
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        // Aqui ele realiza o login
        await act(() => result.current.signInWithGoogle());

        expect(result.current.user).toBeTruthy();
    })
})