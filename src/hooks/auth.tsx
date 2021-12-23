import React, { 
    createContext, 
    ReactNode,
    useContext
} from 'react';

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
}

const AuthContext = createContext({} as IAuthContextData); //irei ter um objeto que é do tipo IAuthContextData

function AuthProvider({ children }: AuthproviderProps){
    const user = {
        id: '1234546545656',
        name: 'Ytalo Lopes',
        email: 'ytalo@email.com'
    };

    return (
        <AuthContext.Provider value={{ user }}>
            { children }
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth }