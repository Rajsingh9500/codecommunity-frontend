"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent } from "../../components/card";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  disabled,
}: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold py-2 px-6 rounded-md shadow-md hover:shadow-lg disabled:opacity-50`}
  >
    {children}
  </button>
);

const CustomInput = ({ label, ...props }: any) => (
  <div className="flex flex-col mb-4">
    <label className="text-sm font-medium mb-1 text-white">{label}</label>
    <input
      {...props}
      className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-black"
    />
  </div>
);

const CustomTextarea = ({ label, ...props }: any) => (
  <div className="flex flex-col mb-4">
    <label className="text-sm font-medium mb-1 text-white">{label}</label>
    <textarea
      {...props}
      className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-black resize-none"
    />
  </div>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    knowus:"",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("Message Sent! Thank you for contacting us.");
    setFormData({  fname: "",
    lname: "",
    email: "",
    knowus:"",subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      info: "support@codecommunity.dev",
      description: "General inquiries and support",
    },
    {
      icon: Phone,
      title: "Phone Support",
      info: "+91 6262253146",
      description: "Mon-Fri, 9 AM - 6 PM EST",
    },
    {
      icon: MapPin,
      title: "Office Location",
      info: "Indore, India",
      description: "Global presence",
    },
    {
      icon: Clock,
      title: "Response Time",
      info: "< 24 hours",
      description: "Average response time",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Contact Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-gray-900/80 to-black"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions about CodeCommunity? We're here to help you connect,
            collaborate, and create amazing projects.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white border border-gray-200 shadow-lg pt-5">
            <CardContent className="p-8  ">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
                <Send className="w-6 h-6 text-emerald-500" />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols gap-4 ">
                  <CustomInput
                    label="First Name *"
                    name="name"
                    value={formData.fname}
                    onChange={handleChange}
                    required
                    placeholder="Your First Name"
                  />
                    <CustomInput
                    label="Last Name *"
                    name="name"
                    value={formData.lname}
                    onChange={handleChange}
                    required
                    placeholder="Your Last Name"
                  />
                  <CustomInput
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                    <CustomInput
                  label="How You Know Us *"
                  name="subject"
                  value={formData.knowus}
                  onChange={handleChange}
                  required
                  placeholder="How You Know Us ? "
                />
                
                <CustomInput
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
                

                <CustomTextarea
                  label="Message *"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                />
                  <CustomButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </CustomButton>
                </div>
              
              </form>
              
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-emerald-400">
                Let's Start a Conversation
              </h2>
              <p className="text-gray-300">
                Whether you're a developer looking to join our community or a
                client seeking talented developers, we're here to help you
                succeed.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <Card
                  key={index}
                  className="bg-white border border-gray-200 shadow-md"
                >
                  <CardContent className="flex items-start gap-4 p-6 text-black">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <item.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-emerald-600 font-medium mb-1">
                        {item.info}
                      </p>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Chat */}
            <Card className=" shadow-lg">
              <CardContent className="flex items-center gap-4 p-6 text-black">
                <MessageCircle className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold mb-1">Need Immediate Help?</h4>
                  <p className="mb-3 text-black/80">
                    Start a live chat with our support team
                  </p>
                  <CustomButton>Start Live Chat</CustomButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-300">Quick answers to common questions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardContent className="p-6 text-black">
                <h4 className="font-semibold mb-2">How do I get started?</h4>
                <p className="text-gray-700">
                  Simply sign up, complete your profile, and start browsing
                  projects or posting your requirements.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardContent className="p-6 text-black">
                <h4 className="font-semibold mb-2">Is CodeCommunity free?</h4>
                <p className="text-gray-700">
                  We offer both free and premium plans. Basic features are free,
                  with advanced tools available in premium.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardContent className="p-6 text-black">
                <h4 className="font-semibold mb-2">
                  How are payments handled?
                </h4>
                <p className="text-gray-700">
                  All payments are processed securely through our platform with
                  escrow protection for both parties.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-md">
              <CardContent className="p-6 text-black">
                <h4 className="font-semibold mb-2">
                  What if I need technical support?
                </h4>
                <p className="text-gray-700">
                  Our technical support team is available 24/7 via chat, email,
                  or phone to assist you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
