"use client";

import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("deployments");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("0");
  const { publicKey, signTransaction, connected } = useWallet();
  const { toast } = useToast();
  const handleRadioChange = (value: string) => {
    console.log(`Radio button value is ${value}`);
    setAmount(value);
  };

  const handleDeploy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: repo,
          amount: amount,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate deployment");
      }
      const result = await response.json();
      console.log(`Deployment scheduled redis id: ${result.id}`);
      if (response.ok) {
        toast({
          title: "Deployment Successful",
          description: "Your project has been successfully deployed.",
        });
      } else {
        throw new Error(result.message || "Failed to deploy");
      }
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden font-sans">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <motion.aside
          className="lg:w-64 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg p-6 border-r border-purple-800"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sidebar content remains the same */}
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
            {/* Header content remains the same */}
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
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">
                        {stat.title}
                      </CardTitle>
                      <stat.icon
                        className={`h-5 w-5 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}
                      />
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${stat.color}`}
                      >
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Deployments */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Recent Deployments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDeployments.map((deployment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {deployment.siteName}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="text-blue-400">
                            {deployment.domain}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {deployment.lastUpdated}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Deploy */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                      Quick Deploy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDeploy} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="repo">GitHub Repository</Label>
                        <Input
                          id="repo"
                          value={repo}
                          onChange={(e) => setRepo(e.target.value)}
                          placeholder="username/repository"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Input
                          id="branch"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder="main"
                        />
                      </div>
                      <div className="space-y-2">
                        <RadioGroup
                          defaultValue="0"
                          onValueChange={handleRadioChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="0" id="free-deploy" />
                            <Label htmlFor="free-deploy">
                              Free Deploy [0 SOL]
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="quick-deploy" />
                            <Label htmlFor="quick-deploy">
                              Quick Deploy [1 SOL]
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="priority-deploy" />
                            <Label htmlFor="priority-deploy">
                              Priority Deploy [5 SOL]
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Button type="submit" className="w-full">
                        <Zap className="mr-2 h-5 w-5" />
                        Deploy
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Domain Management */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                      Domain Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain Name</Label>
                        <Input id="domain" placeholder="mydomain.sol" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target">Target Deployment</Label>
                        <Input id="target" placeholder="Select deployment" />
                      </div>
                      <Button className="w-full">
                        <Globe className="mr-2 h-5 w-5" />
                        Update Domain
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
