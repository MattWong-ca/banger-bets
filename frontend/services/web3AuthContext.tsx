// import { UX_MODE } from "@toruslabs/openlogin-utils";
// import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/base";
// import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { Web3AuthOptions } from "@web3auth/modal";
// import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
// import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

// const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//     config: {
//         chainConfig: {
//             chainNamespace: CHAIN_NAMESPACES.EIP155,
//             chainId: "0x1e",
//             rpcTarget: "https://rootstock.drpc.org",
//             displayName: "Rootstock Mainnet",
//             blockExplorerUrl: "https://explorer.rootstock.io/",
//             ticker: "RBTC",
//             tickerName: "RBTC",
//             logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
//         },
//     },
// });

// const web3AuthOptions: Web3AuthOptions = {
//     chainConfig: {
//         chainNamespace: CHAIN_NAMESPACES.EIP155,
//         chainId: "0x1e",
//         rpcTarget: "https://rootstock.drpc.org",
//         displayName: "Rootstock Mainnet",
//         blockExplorerUrl: "https://explorer.rootstock.io/",
//         ticker: "RBTC",
//         tickerName: "RBTC",
//         logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
//     },
//     clientId,
//     web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
//     privateKeyProvider,
// };

// const openloginAdapter = new OpenloginAdapter({
//     loginSettings: {
//         mfaLevel: "optional",
//     },
//     adapterSettings: {
//         uxMode: UX_MODE.REDIRECT, // "redirect" | "popup"
//     },
// });

// const walletServicesPlugin = new WalletServicesPlugin({
//     wsEmbedOpts: {},
//     walletInitOptions: { whiteLabel: { showWidgetButton: true, buttonPosition: "bottom-right" } },
// });

// const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });

// const web3AuthContextConfig = {
//     web3AuthOptions,
//     adapters: [openloginAdapter, ...adapters],
//     plugins: [walletServicesPlugin],
// };

// export default web3AuthContextConfig;