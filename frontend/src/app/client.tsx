"use client";

import { Web3AuthProvider } from "@web3auth/modal-react-hooks";
import web3AuthContextConfig from "../../services/web3AuthContext";

export default function Web3AuthClient({ children }: { children: React.ReactNode }) {
  return <Web3AuthProvider config={web3AuthContextConfig}>{children}</Web3AuthProvider>;
}