import React, { 
    createContext, 
    ReactNode,
    useContext,
    useState
} from 'react';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AsyncStorage } from 'react-native';

interface AuthproviderProps{
    children: ReactNode; //ReactNode é uma tipagem para elemento filho
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
    signInWithApple(): Promise<void>;
}

interface AuthorizationResponse{
    params: {
        access_token: string;
    };
    type: string;
}

const AuthContext = createContext({} as IAuthContextData); //irei ter um objeto que é do tipo IAuthContextData

function AuthProvider({ children }: AuthproviderProps){
    const [user, setUser] = useState<User>({} as User); //começa como objeto vazio e é do tipo User

    async function signInWithGoogle(){
        try{
            const RESPONSE_TYPE = 'token';
            const SCOPE = encodeURI('profile email');

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

            const { type, params } = await AuthSession
            .startAsync({ authUrl }) as AuthorizationResponse;

            if(type === 'success'){
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
                const userInfo = await response.json();

                setUser({
                    id: userInfo.id,
                    name: userInfo.given_name,
                    email: userInfo.email,
                    photo: userInfo.picture
                });
            }
        }catch(error){
            throw new Error(error as string); //irei tratar lanmcando o erro para quem chamou
        }
    }

    async function signInWithApple(){
        try{
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ]
            });

            if(credential){
                const userLogged = {
                    id: String(credential.user),
                    name: credential.fullName!.givenName!, // ! para garantir que sempre vai ter 
                    email: credential.email!,
                    photo: undefined
                }

                setUser(userLogged);
                await AsyncStorage.setItem('@gofinances:user', JSON.stringify(userLogged))
            }


        } catch(error){
            throw new Error(error as string);
        }
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            signInWithGoogle,
            signInWithApple
            }}>
            { children }
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth }