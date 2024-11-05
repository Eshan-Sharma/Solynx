import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Twitter } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0A1F] text-white">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://bafybeibagjmvlztpgswjqxzwwj7fuoct3a4tbkdxjk3qllj7nsrtoaigna.ipfs.w3s.link/Solynx_icon.jpg"
                alt="Solynx Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Solynx
              </span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link
                href="#features"
                className="hover:text-cyan-400 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#why-solynx"
                className="hover:text-cyan-400 transition-colors"
              >
                Why Solynx
              </Link>
              <Link
                href="#"
                className="bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Welcome to Solynx
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              The Next Generation of Decentralized Web Hosting & Deployment
            </p>
            <Link
              href="#"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-cyan-400 px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              What is Solynx?
            </h2>
            <p className="text-xl text-gray-300">
              Solynx is a decentralized alternative to traditional web hosting
              and deployment platforms like Vercel and Firebase. Built on
              blockchain technology, Solynx offers a secure, transparent, and
              censorship-resistant solution for developers.
            </p>
          </div>
        </section>

        <section id="features" className="py-20 bg-[#1A1432]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Decentralized Hosting",
                  description:
                    "Utilize Arweave and IPFS for secure, immutable storage of your web applications.",
                },
                {
                  title: "Blockchain-Powered",
                  description:
                    "Leverage Solana for payments, deployment tracking, and smart contract management.",
                },
                {
                  title: "True Ownership",
                  description:
                    "Retain full control over your deployments and data, with ownership recorded on the blockchain.",
                },
                {
                  title: "Censorship Resistance",
                  description:
                    "Ensure your content remains accessible, free from central authority control.",
                },
                {
                  title: "Cost Efficiency",
                  description:
                    "Enjoy permanent storage with no recurring costs and lower fees through decentralized payments.",
                },
                {
                  title: "Transparent Deployments",
                  description:
                    "Access a complete, verifiable history of all your deployments on the blockchain.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#2A2442] p-6 rounded-xl border border-purple-500/20 hover:border-cyan-400/40 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why-solynx" className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Why Choose Solynx?
          </h2>
          <ul className="max-w-2xl mx-auto text-lg space-y-4">
            {[
              "Improved security and integrity of deployments",
              "Decentralized access control without relying on central authorities",
              "Global accessibility without regional restrictions",
              "Reduced risk of outages due to decentralized infrastructure",
              "Open ecosystem promoting interoperability",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center space-x-3 text-gray-300"
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#1A1432] py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Get Started Today
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join the revolution in web hosting and deployment. Experience the
              power of decentralization with Solynx.
            </p>
            <Link
              href="#"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-cyan-400 px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Sign Up Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#0A0813] py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="https://bafybeibagjmvlztpgswjqxzwwj7fuoct3a4tbkdxjk3qllj7nsrtoaigna.ipfs.w3s.link/Solynx_icon.jpg"
                alt="Solynx Logo"
                width={30}
                height={30}
                className="rounded-full"
              />
              <span className="text-gray-400">
                &copy; 2024 Solynx. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="https://x.com/Solynx108"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Twitter size={24} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-purple-500 transition-colors"
              >
                <Github size={24} />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
