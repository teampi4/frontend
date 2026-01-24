import { Toaster } from "@/components/ui/sonner";
import { HeaderProvider } from "@/stores/ui/header/HeaderProvider";

type ProviderProps = {
    children: React.ReactNode;
}


export const AppProvider = ({ children }: ProviderProps) => {
    return (
        <HeaderProvider>
            {children}
            <Toaster />
        </HeaderProvider>
    );

}
