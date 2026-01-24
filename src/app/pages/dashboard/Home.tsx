import { useHeader } from "@/hooks/useHeader";
import { useEffect } from "react";

export const DashboardHome = () => {
    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader({
            pageName: "Início",
            pathPage: null,
            actions: null,
        });


        return () => {
            setHeader({
                pageName: "",
                pathPage: null,
                actions: null,
            });
        }
    }, [setHeader]);

    
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao Dashboard</h1>
        </div>
    )
}