import { CustomWrapper } from "@/customization/custom-wrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ReactFlowProvider } from "reactflow";
import { TooltipProvider } from "../components/ui/tooltip";
import { ApiInterceptor } from "../controllers/API/api";
import { AuthProvider } from "./authContext";

const queryClient = new QueryClient();

export default function ContextWrapper({ children }: { children: ReactNode }) {
  //element to wrap all context
  return (
    <>
      <CustomWrapper>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider skipDelayDuration={0}>
              <ReactFlowProvider>
                <ApiInterceptor />
                {children}
              </ReactFlowProvider>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </CustomWrapper>
    </>
  );
}
