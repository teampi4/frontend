import { useHeader } from "@/hooks/useHeader";
import type { HeaderAction } from "@/stores/ui/header/HeaderContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function renderAction(action: HeaderAction, i: number) {
  if (action.type === "node") {
    return <div key={i}>{action.node}</div>;
  }

  console.log(action);
  

  const base =
    "h-10 px-4 rounded-md inline-flex items-center gap-2 text-sm font-medium";

  const variants = {
    primary: "bg-white text-gray-900",
    secondary: "bg-white/90 text-gray-900",
    success: "bg-[#2BBF9A] text-white",
    transparent: "bg-transparent text-white",
  };
  

  return (
    <button
      key={i}
      onClick={action.onClick}
      className={`${base} ${variants[action.variant ?? "primary"]} cursor-pointer`}
    >
      {action.icon}
      {action.label}
    </button>
  );
}


export const Header = () => {
    const navigate = useNavigate();
    const { header } = useHeader();

    const handleBack = () => {
        navigate(-1);
    }
    

    return (
        <header className=" bg-[#2A64E8] flex items-center justify-between px-6 min-h-16 ">
            <div className="flex">
                <div className="flex items-center">
                    {(header.pageName != "Início" && header.pageName != "Entrar")  &&
                        <button id="back-button" onClick={handleBack} className="cursor-pointer p-2">
                            <ArrowLeft className="text-white" />
                        </button>
                    }
                    <h1 className="text-white text-xl font-semibold inline-block ml-2">          
                        {header.pageName}
                    </h1>
                </div>
                
                <div className="ml-6 flex text-lg items-center">
                    {header.pathPage && (
                        <span className="text-white text-lg">
                            {header.pathPage}
                        </span>
                    )}
                </div>
                
            </div>

            <div className="ml-auto flex items-center gap-3">
                {header.actions?.map(renderAction)}
            </div>
        </header>
    );
}
