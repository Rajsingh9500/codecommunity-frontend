"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
  const companies = [
    { name: "Google", logo: "/logos/google.png" },
    { name: "Microsoft", logo: "/logos/microsoft.png" },
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "IBM", logo: "/logos/ibm.png" },
    { name: "Infosys", logo: "/logos/infosys.png" },
    { name: "TCS", logo: "/logos/tcs.png" },
    { name: "Deloitte", logo: "/logos/deloitte.png" },
    { name: "Adobe", logo: "/logos/adobe.png" },
    { name: "Meta", logo: "/logos/meta.png" },
    { name: "Wipro", logo: "/logos/wipro.png" },
  ];

  const features = [
    {
      title: "Verified Developers",
      desc: "Skilled developers, verified for quality and reliability.",
    },
    {
      title: "Secure Payments",
      desc: "Safe, transparent, and hassle-free payment system.",
    },
    {
      title: "24/7 Support",
      desc: "Get help anytime with our always-available support.",
    },
  ];

  const steps = [
    {
      title: "Post a Project",
      desc: "Describe your project and set your requirements.",
    },
    {
      title: "Hire Developer",
      desc: "Choose the best developers and start collaborating.",
    },
    {
      title: "Launch Project",
      desc: "Complete your project successfully and celebrate your success!",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-850 to-black text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
     

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Build, Connect & Grow with CodeCommunity
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect talented developers with visionary clients and bring amazing projects to life.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/Register"
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-cyan-400/40 transition transform hover:-translate-y-1"
            >
              Join as Developer
            </Link>
            <Link
              href="/"
              className="border border-emerald-400 px-8 py-3 rounded-lg hover:bg-emerald-400 hover:text-black transition transform hover:-translate-y-1"
            >
              Hire Talent
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-emerald-400">
            Why CodeCommunity?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gray-800/70 border border-gray-700 hover:border-emerald-400 shadow-lg hover:shadow-emerald-400/40 transition transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {f.title}
                </h3>
                <p className="text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-24 bg-gradient-to-r from-gray-950 via-gray-900 to-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-emerald-400">
            Top Companies Connected with Us
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-12 items-center justify-items-center">
            {companies.map((c) => (
              <div key={c.name} className="flex flex-col items-center">
                <div className="p-6 rounded-2xl bg-gray-800 border border-gray-700 shadow-md">
                  <Image
                    src={c.logo}
                    alt={c.name}
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 font-semibold text-gray-300">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12 text-emerald-400">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gray-800/70 border border-gray-700 hover:border-emerald-400 shadow-lg hover:shadow-emerald-400/40 transition transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {s.title}
                </h3>
                <p className="text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
