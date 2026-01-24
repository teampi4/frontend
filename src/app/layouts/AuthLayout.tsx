import { Header } from "@/components/layout/Header";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {

    return (
        <div>
            <div>
                <Header />
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}