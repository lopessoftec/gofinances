import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from "./auth"

// coloquei esse jest para sair de um erro
jest.mock('expo-apple-authentication', () => { });

// irei mocar a biblioteca expo-auth-session
jest.mock('expo-auth-session', () => {
    return {
        startAsync: () => {
            return {
                type: 'success',
                params: {
                    access_token: 'google-token'
                }
            }
        }
    }
})

// 1 - Abre uma tela para o usuário autenticar
// Em um teste não podemos depender de fatores externos

// 2 - Renorna type e params
// 3 - Fetch dos dados de perfil no servidor da google

describe('Auth Hook', () => {
    it('should be able to sign in with Google account existing', async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({
                id: `userInfo.id`,
                email: `userInfo.email`,
                name: `userInfo.given_name`,
                photo: `userInfo.picture`,
                locale: `userInfo.locale`,
                verified_email: `userInfo.verified_email`,
            })
        })) as jest.Mock;

        // Por volta do useAuth() é passado o AuthProvider
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });

        // Aqui ele realiza o login
        await act(() => result.current.signInWithGoogle());

        expect(result.current.user).toBeTruthy();
    })
})