"use client";

import { Code, Target, Users, Heart, Shield } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent } from "../../components/card";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust",
      description: "Building reliable connections between developers and clients",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Fostering teamwork and communication in every project",
    },
    {
      icon: Code,
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge technology solutions",
    },
  ];

  const team = [
    {
      name: "Raj Singh",
      role: "Founder & CEO",
      bio: "Developer and visionary, passionate about building innovative platforms and strong developer communities.",
    },
    {
      name: "Vaibhav Gupta",
      role: "Co-Founder & CTO",
      bio: "Tech enthusiast and strategist, focused on scalable solutions and real-world impact through technology.",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0">
         
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-gray-900/80 to-black"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            About CodeCommunity
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            We're on a mission to revolutionize how developers and clients
            collaborate, creating a platform where innovation meets opportunity.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-gray-800/70 border border-gray-700 shadow-lg hover:border-emerald-400 transition">
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Target className="w-8 h-8 text-emerald-400" />
                <h3 className="text-2xl font-bold text-black">Our Mission</h3>
              </div>
              <p className="text-black leading-relaxed">
                To bridge the gap between talented developers and visionary
                clients by providing a comprehensive platform that facilitates
                seamless collaboration, communication, and project delivery.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/70 border border-gray-700 shadow-lg hover:border-cyan-400 transition">
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Heart className="w-8 h-8 text-cyan-400" />
                <h3 className="text-2xl font-bold text-black">Our Vision</h3>
              </div>
              <p className="text-black leading-relaxed">
                To become the world's most trusted platform for
                developer-client collaboration, where every project is a success
                story and every connection leads to innovation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-to-r from-gray-950 via-gray-900 to-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-emerald-400">
            Our Values
          </h2>
          <p className="text-lg text-white mb-12">
            The principles that guide everything we do
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, i) => (
              <Card
                key={i}
                className="bg-gray-800/70 border border-gray-700 shadow-lg hover:border-emerald-400 transition"
              >
                <CardContent className="text-center">
                  <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="text-xl font-semibold text-black mb-4">
                    {value.title}
                  </h4>
                  <p className="text-black">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-emerald-400">
            Meet Our Team
          </h2>
          <p className="text-lg text-white mb-12">
            The passionate individuals building the future of developer
            collaboration
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
            {team.map((member, i) => (
              <Card
                key={i}
                className="mx-auto w-full max-w-sm bg-gray-800/70 border border-gray-700 shadow-lg hover:border-cyan-400 transition"
              >
                <CardContent className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-black mb-2">
                    {member.name}
                  </h4>
                  <p className="text-emerald-400 font-medium mb-4">
                    {member.role}
                  </p>
                  <p className="text-black">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
