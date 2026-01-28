import { useHeader } from "@/hooks/useHeader";
import { ChevronDown, Plus,  LayoutGrid, Search, Bell, CircleQuestionMark } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const DashboardInventory = () => {
    const { setHeader } = useHeader();
    const navigate = useNavigate();

    useEffect(() => {
        setHeader({
        pageName: "Inventário",
        pathPage: "",
        actions: [
            {
                type: "node",
                node: (
                    <input
                    className="h-10 w-64 rounded-md px-3 text-sm bg-white"
                    placeholder="Procurar Produtos..."
                    />
                ),
            },
            {
                type: "button",
                label: "Buscar",
                icon: <Search className="h-4 w-4" />,
                variant: "primary",
                onClick: () => {},
            },
            {
                type: "button",
                label: "Filtrar",
                icon: <LayoutGrid className="h-4 w-4" />,
                variant: "primary",
                onClick: () => {},
            },
            {
                type: "button",
                label: "Mais ações",
                icon: <ChevronDown className="h-4 w-4" />,
                variant: "primary",
                onClick: () => {},
            },
            {
                type: "button",
                label: "Novo Produto",
                icon: <Plus className="h-4 w-4" />, 
                onClick: () => navigate("/dashboard/inventario/adicionar-estoque"),
                variant: "success",
            },
            {
                type: "button",
                label: "",
                icon: < Bell className="h-6 w-6" />,
                onClick: () => {},
                variant: "transparent",
            },
            {
                type: "button",
                label: "",
                icon: <CircleQuestionMark className="h-6 w-6" />,
                onClick: () => {},
                variant: "transparent",
            },
        ],
        });

    return () => setHeader({
        pageName: "",
        pathPage: null,
        actions: null,
    });

  }, [setHeader]);

    return (
        <div>
            <h2>Inventory Management Page</h2>
        </div>
    )
}