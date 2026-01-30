import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardHome } from "./pages/dashboard/Home";
import { DashboardInventory } from "./pages/dashboard/Inventory";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardProducts } from "./pages/dashboard/Products";
import { DashboardInsumos } from "./pages/dashboard/Insumos";
import { DashboardProducao } from "./pages/dashboard/Producao";
import { DashboardRegistrations } from "./pages/dashboard/Registrations";
import { Login } from "./pages/auth/Login";
import { AddEstoquePage } from "./pages/dashboard/AddEstoquePage";
import { DashboardSales } from "./pages/dashboard/Sales";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth/entrar" />,
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path: "entrar",
                element: <Login />,
            }
        ]
    },
    {
        path: "/dashboard",
        element: <ProtectedRoute />,
        children: [
        {
            element: <DashboardLayout />,
            children: [
            {
                path: "inicio",
                element: <DashboardHome />,
                
            },
            {
                path: "produtos",
                element: <DashboardProducts />,
            },
            {
                path: "vendas",
                element: <DashboardSales />,
            },
            {
                path: "inventario",
                element: <DashboardInventory />
            },
            {
                path: "insumos",
                element: <DashboardInsumos />
            },
            {
                path: "producao",
                element: <DashboardProducao />
            },
            {
                path: "cadastros",
                element: <DashboardRegistrations />
            },
            {
                path: "inventario/adicionar-estoque",
                element: <AddEstoquePage />
            }
            ]
        },

        ]
    }
])
