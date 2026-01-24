import { useContext } from "react";
import { HeaderContext } from "../stores/ui/header/HeaderContext";

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("O hook useHeader não pode ser usado fora do HeaderProvider");
    }
    return context;
}