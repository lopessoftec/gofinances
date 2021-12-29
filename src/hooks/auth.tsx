import React, { 
    createContext, 
    ReactNode,
    useContext,
    useState,
    useEffect
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
    signOut(): Promise<void>;
    userStorageLoading: boolean;
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
    const [userStorageLoading, setUserStorageLoading] = useState(true);

    const userStoragekey = '@gofinances:user';

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

                const userLogged = {
                    id: String(userInfo.id),
                    name: userInfo.given_name,
                    email: userInfo.email,
                    photo: userInfo.picture
                }
                setUser(userLogged);
                await AsyncStorage.setItem(userStoragekey, JSON.stringify(userLogged));
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
                const name = credential.fullName!.givenName!;
                const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;

                const userLogged = {
                    id: String(credential.user),
                    name, // ! para garantir que sempre vai ter 
                    email: credential.email!,
                    photo
                }

                setUser(userLogged);
                await AsyncStorage.setItem(userStoragekey, JSON.stringify(userLogged))
            }


        } catch(error){
            throw new Error(error as string);
        }
    }

    async function signOut(){
        setUser({} as User);

        await AsyncStorage.removeItem(userStoragekey);
    }

    useEffect(() => {
        async function loadUserStorageDate(){
            const userStoraged = await AsyncStorage.getItem(userStoragekey);

            if(userStoraged){
                const userLogged = JSON.parse(userStoraged) as User;
                setUser(userLogged);
            }

            setUserStorageLoading(false);
        }

        loadUserStorageDate();
    },[]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            signInWithGoogle,
            signInWithApple,
            signOut,
            userStorageLoading
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