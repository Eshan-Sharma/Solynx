"use clients";
import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Zap,
  Wallet,
  Globe,
  Box,
  Settings,
  HelpCircle,
  LogOut,
  BarChart,
  Cloud,
  Cpu,
} from "lucide-react";

interface DeploymentData {
  siteName: string;
  status: "Live" | "Building" | "Failed";
  domain: string;
  lastUpdated: string;
}

const recentDeployments: DeploymentData[] = [
  {
    siteName: "Quantum dApp",
    status: "Live",
    domain: "quantum-dapp.sol",
    lastUpdated: "2 hours ago",
  },
  {
    siteName: "NFT Nexus",
    status: "Building",
    domain: "nft-nexus.sol",
    lastUpdated: "5 minutes ago",
  },
  {
    siteName: "DeFi Pulse",
    status: "Live",
    domain: "defi-pulse.sol",
    lastUpdated: "1 day ago",
  },
  {
    siteName: "Crypto Horizon",
    status: "Failed",
    domain: "crypto-horizon.sol",
    lastUpdated: "3 hours ago",
  },
];

const uploadhandler: any = async () => {
  // const cid = await uploadFolderToPinata('../../../output/9hbgn');
  console.log("cid is the ");
};
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("deployments");
  const { publicKey } = useWallet();
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden font-sans"
      onClick={uploadhandler}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <motion.aside
          className="lg:w-64 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg p-6 border-r border-purple-800"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-8">
            <Zap className="h-8 w-8 text-purple-500 mr-2" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Solynx
            </span>
          </div>
          <nav className="space-y-4">
            {[
              { icon: Box, label: "Deployments", value: "deployments" },
              { icon: Globe, label: "Domains", value: "domains" },
              { icon: BarChart, label: "Analytics", value: "analytics" },
              { icon: Settings, label: "Settings", value: "settings" },
            ].map((item) => (
              <button
                key={item.value}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === item.value
                    ? "bg-purple-700 text-white"
                    : "text-gray-400 hover:bg-purple-800 hover:text-white"
                }`}
                onClick={() => setActiveTab(item.value)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg border-b border-purple-800 p-4 flex justify-between items-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="border hover:border-slate-900 rounded">
                <WalletMultiButton style={{}} />
              </div>

              <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-800 transition-colors duration-300">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-800 transition-colors duration-300">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </motion.header>

          {/* Content */}
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Deployments",
                  value: "24",
                  icon: Box,
                  color: "from-purple-400 to-pink-600",
                },
                {
                  title: "Active Domains",
                  value: "7",
                  icon: Globe,
                  color: "from-green-400 to-blue-500",
                },
                {
                  title: "Total Storage Used",
                  value: "1.2 GB",
                  icon: Cloud,
                  color: "from-yellow-400 to-orange-500",
                },
                {
                  title: "SOL Balance",
                  value: "4.2 SOL",
                  icon: Wallet,
                  color: "from-indigo-400 to-cyan-400",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-purple-800"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-400">
                      {stat.title}
                    </p>
                    <stat.icon
                      className={`h-5 w-5 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}
                    />
                  </div>
                  <p
                    className={`text-2xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-br ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Recent Deployments */}
            <motion.div
              className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-purple-800"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Recent Deployments
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400">
                      <th className="pb-3">Site Name</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Domain</th>
                      <th className="pb-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeployments.map((deployment, index) => (
                      <tr key={index} className="border-t border-purple-800">
                        <td className="py-3 font-medium">
                          {deployment.siteName}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              deployment.status === "Live"
                                ? "bg-green-500 text-green-900"
                                : deployment.status === "Building"
                                ? "bg-yellow-500 text-yellow-900"
                                : "bg-red-500 text-red-900"
                            }`}
                          >
                            {deployment.status}
                          </span>
                        </td>
                        <td className="py-3 text-blue-400">
                          {deployment.domain}
                        </td>
                        <td className="py-3 text-gray-400">
                          {deployment.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Deploy */}
              <motion.div
                className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-purple-800"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Quick Deploy
                </h2>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="repo"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      GitHub Repository
                    </label>
                    <input
                      id="repo"
                      type="text"
                      placeholder="username/repository"
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Branch
                    </label>
                    <input
                      id="branch"
                      type="text"
                      placeholder="main"
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Deploy
                  </button>
                </form>
              </motion.div>

              {/* Domain Management */}
              <motion.div
                className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-purple-800"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Domain Management
                </h2>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="domain"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Domain Name
                    </label>
                    <input
                      id="domain"
                      type="text"
                      placeholder="mydomain.sol"
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="target"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Target Deployment
                    </label>
                    <input
                      id="target"
                      type="text"
                      placeholder="Select deployment"
                      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Update Domain
                  </button>
                </form>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
