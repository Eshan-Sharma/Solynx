"use client";

import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
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
  ChevronRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [branch, setBranch] = useState("main");
  const [amount, setAmount] = useState("0");
  const { publicKey, connected, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [balance, setBalance] = useState(0);
  const [selectedDeployment, setSelectedDeployment] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [deployments, setDeployments] = useState(recentDeployments);
  const connection = new Connection("https://api.devnet.solana.com");

  useEffect(() => {
    setIsClient(true);

    const fetchBalance = async (publicKey: PublicKey | null) => {
      if (!publicKey) return;
      try {
        const balance = await connection.getBalance(publicKey);
        const solAmount = balance / LAMPORTS_PER_SOL;
        setBalance(solAmount);
      } catch (error) {
        setBalance(0);
        console.error("Error fetching SOL balance:", error);
      }
    };
    if (publicKey) {
      fetchBalance(publicKey);
    }
  }, [publicKey, connection]);
  const handleRadioChange = (value: string) => {
    console.log(`Radio button value is ${value}`);
    setAmount(value);
  };

  const handleDeploy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!publicKey || !connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Solana wallet first.",
        variant: "destructive",
      });
      return;
    }
    try {
      const recipient = new PublicKey(
        "6oSkwae3LxcrkDudFBS6Cwpzv8rkub5E587nSHY3KarG"
      );
      const solAmount = parseFloat(amount) * LAMPORTS_PER_SOL;
      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: solAmount,
        })
      );
      // Sign and send the transaction
      const signature = await sendTransaction(transaction, connection);
      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(
        signature,
        "processed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      } else {
        toast({
          title: "Transaction Successful",
          description: `You have sent ${amount} SOL to the recipient.`,
        });
      }
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
  const handleUpdateDomain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDeployment && newDomain) {
      setDeployments((prevDeployments) =>
        prevDeployments.map((deployment) =>
          deployment.siteName === selectedDeployment
            ? { ...deployment, domain: newDomain }
            : deployment
        )
      );
      toast({
        title: "Domain Updated",
        description: `Domain for ${selectedDeployment} has been updated to ${newDomain}`,
      });
      setSelectedDeployment("");
      setNewDomain("");
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <motion.aside
        className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col flex-1 gap-4 border-r bg-gray-800 border-gray-700 px-4 py-6">
          <div className="flex items-center gap-2 px-4">
            <Image
              src="https://bafybeibagjmvlztpgswjqxzwwj7fuoct3a4tbkdxjk3qllj7nsrtoaigna.ipfs.w3s.link/Solynx_icon.jpg"
              alt="Solynx Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-cyan-300">
              Solynx
            </span>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2">
              <Button
                variant={activeTab === "deployments" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setActiveTab("deployments")}
              >
                <Box className="h-4 w-4" />
                Deployments
              </Button>
              <Button
                variant={activeTab === "domains" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setActiveTab("domains")}
              >
                <Globe className="h-4 w-4" />
                Domains
              </Button>
              <Button
                variant={activeTab === "analytics" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart className="h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </ScrollArea>
          <div className="px-4 py-2 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center flex-1 gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">John Doe</span>
                      <span className="text-xs text-gray-400">
                        john@solynx.dev
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[240px] bg-gray-800 text-gray-100"
              >
                <DropdownMenuItem className="hover:bg-gray-700">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">
                  Settings
                </DropdownMenuItem>
                <Separator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 border-b bg-gray-800 border-gray-700">
          <div className="flex h-16 items-center gap-4 px-4">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded border border-gray-700">
                {isClient && <WalletMultiButton />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Deployments",
                value: "24",
                icon: Box,
                color: "from-purple-400 to-cyan-300",
              },
              {
                title: "Active Domains",
                value: "4",
                icon: Globe,
                color: "from-purple-400 to-cyan-300",
              },
              {
                title: "Total Storage Used",
                value: "1.2 GB",
                icon: Cloud,
                color: "from-purple-400 to-cyan-300",
              },
              {
                title: "SOL Balance",
                value: `${balance} SOL`,
                icon: Wallet,
                color: "from-purple-400 to-cyan-300",
              },
            ].map((stat, index) => (
              <Card key={stat.title} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Deployments */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Site Name</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Domain</TableHead>
                    <TableHead className="text-gray-300">
                      Last Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deployments.map((deployment, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="font-medium text-gray-100">
                        {deployment.siteName}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            deployment.status === "Live"
                              ? "bg-green-400/10 text-green-400 ring-green-400/20"
                              : deployment.status === "Building"
                              ? "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20"
                              : "bg-red-400/10 text-red-400 ring-red-400/20"
                          }`}
                        >
                          {deployment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-purple-400">
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

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Deploy */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Deploy</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeploy} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo" className="text-gray-300">
                      GitHub Repository
                    </Label>
                    <Input
                      id="repo"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-gray-300">
                      Branch
                    </Label>
                    <Input
                      id="branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <RadioGroup
                      defaultValue="0"
                      onValueChange={(value) => setAmount(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="0"
                          id="free-deploy"
                          className="border-gray-400 text-purple-400"
                        />
                        <Label htmlFor="free-deploy" className="text-gray-300">
                          Free Deploy [0 SOL]
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="1"
                          id="quick-deploy"
                          className="border-gray-400 text-purple-400"
                        />
                        <Label htmlFor="quick-deploy" className="text-gray-300">
                          Quick Deploy [1 SOL]
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="5"
                          id="priority-deploy"
                          className="border-gray-400 text-purple-400"
                        />
                        <Label
                          htmlFor="priority-deploy"
                          className="text-gray-300"
                        >
                          Priority Deploy [5 SOL]
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-400 to-cyan-300 text-gray-900 hover:from-purple-500 hover:to-cyan-400"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Deploy Now
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Domain Management */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Domain Management</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateDomain} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deployment" className="text-gray-300">
                      Select Deployment
                    </Label>
                    <Select
                      onValueChange={setSelectedDeployment}
                      value={selectedDeployment}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Select a deployment" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {deployments.map((deployment) => (
                          <SelectItem
                            key={deployment.siteName}
                            value={deployment.siteName}
                            className="text-gray-100"
                          >
                            {deployment.siteName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newDomain" className="text-gray-300">
                      New Domain
                    </Label>
                    <Input
                      id="newDomain"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="Enter new domain"
                      className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-400 to-cyan-300 text-gray-900 hover:from-purple-500 hover:to-cyan-400"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Update Domain
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
