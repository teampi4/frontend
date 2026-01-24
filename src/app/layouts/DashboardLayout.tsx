import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Outlet } from "react-router-dom";


export const DashboardLayout = () => {
    return (
        <div className="h-screen grid grid-cols-[90px_1fr] grid-rows-[76px_1fr]">  
            <div className="row-span-2 m-auto border-r overflow-y-auto">   
                <Sidebar />
            </div>

            <div>
                <Header />
            </div>

            <main className="overflow-y-auto p-4 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}