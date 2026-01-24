import { useHeader } from "@/hooks/useHeader";
import { Bell, ChevronDown, CircleQuestionMark, LayoutGrid, Plus, Search } from "lucide-react";
import { useEffect } from "react";

export const DashboardProducts = () => {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      pageName: "Produtos",
      pathPage: ['Início', 'Produtos'].join(" > "),
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
          onClick: () => {},
          variant: "success",
        },
        {
          type: "button",
          label: "",
          icon: <Bell className="h-6 w-6" />,
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
            <h2>Products Management Page</h2>
        </div>
    )
}