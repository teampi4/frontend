import { createContext, type ReactNode } from "react";

export type HeaderAction =
  | {
      type: "node";
      node: ReactNode;
    }
  | {
      type: "button";
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: "primary" | "secondary" | "success" | "transparent";
    };

export interface HeaderState {
  pageName: string;
  pathPage: string | null;
  actions: HeaderAction[] | null;
}

export const HeaderContext = createContext<{
  header: HeaderState;
  setHeader: React.Dispatch<React.SetStateAction<HeaderState>>;
} | null>(null);
