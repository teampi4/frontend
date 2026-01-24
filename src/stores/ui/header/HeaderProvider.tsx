import { useMemo, useState } from "react";
import { HeaderContext, type HeaderState } from "./HeaderContext";


interface HeaderProviderProps {
    children: React.ReactNode;
}


export const HeaderProvider = ({ children }: HeaderProviderProps) => {
    const [header, setHeader] = useState<HeaderState>({
        pageName: "",
        pathPage: null,
        actions: null
    })

    const value = useMemo(() => ({ header, setHeader }), [header, setHeader]);


    return (        
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
}