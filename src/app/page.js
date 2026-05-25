"use client";

import { Building, Briefcase, Calculator, Car, FileText, Home, Landmark, Shield } from 'lucide-react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();

  const radius = 160;

  const rotation = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useAnimationFrame((t) => {
    // speed control (0.02 = slow, 0.05 = fast)
    rotation.set((t * 0.03) % 360);
  });
  useEffect(() => {
    const unsubscribe = rotation.on("change", (latest) => {
      const currentRotation = ((latest % 360) + 360) % 360;

      let closestIndex = 0;
      let smallestDiff = Infinity;

      items.forEach((_, i) => {
        // base angle (same offset as icons)
        const baseAngle = (360 / items.length) * i - 90;

        // final visible angle
        const visibleAngle = (baseAngle + currentRotation + 360) % 360;

        // distance from right side (0deg)
        const diff = Math.min(
          Math.abs(visibleAngle - 0),
          Math.abs(visibleAngle - 360)
        );

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestIndex = i;
        }
      });

      setActiveIndex(closestIndex);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    {
      title: "Home Loan",
      description:
        "Best home loan solutions with low interest rates and fast approval process.",
      icon: "🏠",
    },
    {
      title: "Business Loan",
      description:
        "Flexible business loans to expand and grow your company smoothly.",
      icon: "💼",
    },
    {
      title: "Personal Loan",
      description:
        "Instant personal loan assistance with minimal documentation.",
      icon: "💳",
    },
    {
      title: "Car Loan",
      description:
        "Affordable car financing with attractive EMI options.",
      icon: "🚗",
    },
    {
      title: "Machinery Loan",
      description:
        "Industrial machinery and equipment financing for businesses.",
      icon: "🏭",
    },
    {
      title: "GST Registration",
      description:
        "Complete GST registration and compliance support for businesses.",
      icon: "📑",
    },
    {
      title: "GST Return Filing",
      description:
        "Monthly and yearly GST return filing with professional guidance.",
      icon: "📊",
    },
    {
      title: "Income Tax Return",
      description:
        "Fast and accurate ITR filing services for individuals & companies.",
      icon: "💰",
    },
    {
      title: "Accounting Services",
      description:
        "Professional accounting and bookkeeping services for all businesses.",
      icon: "📘",
    },
    {
      title: "Project Loan",
      description:
        "Financial solutions for startups and industrial projects.",
      icon: "🏗️",
    },
    {
      title: "Insurance Services",
      description:
        "Life, health, vehicle, and business insurance consultancy.",
      icon: "🛡️",
    },
    {
      title: "Company Registration",
      description:
        "Private Limited, LLP, and MSME registration assistance.",
      icon: "🏢",
    },
  ];

  const items = [
    {
      icon: Home,
      label: "Home Loan",
      description: "Low interest home loans with fast approval.",
      color: "bg-blue-500",
    },
    {
      icon: Briefcase,
      label: "Business Loan",
      description: "Flexible financing to grow your business.",
      color: "bg-emerald-500",
    },
    {
      icon: FileText,
      label: "GST Services",
      description: "Registration and return filing made easy.",
      color: "bg-orange-500",
    },
    {
      icon: Landmark,
      label: "Income Tax",
      description: "Accurate ITR filing for individuals and firms.",
      color: "bg-rose-500",
    },
    {
      icon: Calculator,
      label: "Accounting",
      description: "Professional bookkeeping and accounting.",
      color: "bg-indigo-500",
    },
    {
      icon: Car,
      label: "Vehicle Loan",
      description: "Affordable financing for your dream car.",
      color: "bg-sky-500",
    },
    {
      icon: Shield,
      label: "Insurance",
      description: "Comprehensive life, health, and vehicle cover.",
      color: "bg-yellow-500",
    },
    {
      icon: Building,
      label: "Company Reg.",
      description: "Hassle-free business registration services.",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-[#f5f5ef] overflow-x-hidden">
      {/* ================= NAVBAR ================= */}

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white shadow-lg py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO */}

            {/* PREMIUM LOGO */}

            <div className="flex items-center">
              <div className="relative w-20">
                <Image
                  src="/Ramkrishna.png"
                  alt="Ramkrushn Consultancy Logo"
                  width={200}
                  height={200}
                  priority
                  className="object-contain p-1"
                />
              </div>
            </div>

            {/* DESKTOP MENU */}

            <div className="hidden bg-[#1c3430] py-3 px-10 rounded-full lg:flex items-center gap-8">
              <a
                href="#home"
                className="font-semibold text-[#dfc797] transition"
              >
                Home
              </a>

              <a
                href="#services"
                className="font-semibold text-[#dfc797] transition"
              >
                Services
              </a>

              <a
                href="#about"
                className="font-semibold text-[#dfc797] transition"
              >
                About
              </a>

              <a
                href="#contact"
                className="font-semibold text-[#dfc797] transition"
              >
                Contact
              </a>

              {/* <button
                onClick={() => router.push("/admin")}
                className="px-6 py-3 rounded-full bg-[#1c3430] text-[#dfc797] font-bold hover:bg-[#0f1f1c] transition-all duration-300 hover:scale-105"
              >
                Admin Login
              </button> */}
            </div>

            {/* MOBILE BUTTON */}

            <button
              className="lg:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <svg
                className="w-8 h-8 text-[#1c3430]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* MOBILE MENU */}

          {mobileMenu && (
            <div className="lg:hidden mt-5 bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col gap-5">
                <a href="#home" className="font-semibold text-[#1c3430]">
                  Home
                </a>

                <a href="#services" className="font-semibold text-[#1c3430]">
                  Services
                </a>

                <a href="#about" className="font-semibold text-[#1c3430]">
                  About
                </a>

                <a href="#contact" className="font-semibold text-[#1c3430]">
                  Contact
                </a>
                {/* 
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full py-3 rounded-full bg-[#1c3430] text-[#dfc797] font-bold"
                >
                  Admin Login
                </button> */}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}

      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden lg:py-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c3430] via-[#132622] to-[#0d1715]"></div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-[#dfc797] opacity-10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#dfc797] opacity-10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-10 lg:pt-28 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-14 items-center">
            {/* LEFT CONTENT */}

            <div className="text-center lg:text-left">
              <div className="inline-block px-5 py-2 rounded-full bg-[#dfc797]/20 border border-[#dfc797]/30 text-[#dfc797] font-semibold mb-6">
                Trusted Financial Consultancy
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                Smart Financial
                <span className="block text-[#dfc797]">
                  Solutions For You
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                We provide complete consultancy services for all types of
                Loans, GST, Income Tax, Accounting, Insurance, and Business
                Registration with professional guidance.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <a
                  href="#services"
                  className="px-8 py-4 rounded-full bg-[#dfc797] text-[#1c3430] font-bold hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  Explore Services
                </a>

                <a
                  href="#contact"
                  className="px-8 py-4 rounded-full border-2 border-[#dfc797] text-[#dfc797] font-bold hover:bg-[#dfc797] hover:text-[#1c3430] transition-all duration-300"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* RIGHT IMAGE */}

            <div className="relative flex justify-center items-center scale-[0.85] sm:scale-100 mt-12 sm:mt-16 lg:mt-0 mb-8 lg:mb-0">

              {/* Rotating Icons */}
              <motion.div
                className="relative w-[320px] h-[320px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{ rotate: rotation }}
              >
                {items.map((item, i) => {
                  const angle = (360 / items.length) * i - 10;
                  const rad = (angle * Math.PI) / 180;
                  const x = radius * Math.cos(rad);
                  const y = radius * Math.sin(rad);
                  const Icon = item.icon;

                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      }}
                    >
                      <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg`} >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* CENTER CONTENT (FIXED, NOT ROTATING) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-[220px] px-4 py-4">
                  <span className="text-xs font-medium text-white uppercase tracking-wide">
                    Current Stage
                  </span>

                  <h3 className="mt-2 text-lg font-bold text-[#dfc797]">
                    {items[activeIndex].label}
                  </h3>

                  <p className="mt-2 text-sm text-white">
                    {items[activeIndex].description}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section >

      {/* ================= SERVICES ================= */}

      < section id="services" className="py-24 bg-[#f5f5ef]" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1c3430]">
              Our Services
            </h2>

            <div className="w-28 h-1 bg-[#dfc797] mx-auto rounded-full mt-5"></div>

            <p className="mt-6 text-[#4b4c49] max-w-3xl mx-auto text-lg">
              We provide complete financial, taxation, and consultancy
              solutions for individuals and businesses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-16">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 border border-[#dfc797]/30 hover:bg-[#1c3430] transition-all duration-500 hover:-translate-y-3 shadow-md hover:shadow-2xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#1c3430] text-white text-4xl flex items-center justify-center group-hover:bg-[#dfc797] group-hover:text-[#1c3430] transition-all duration-500">
                  {service.icon}
                </div>

                <h3 className="mt-6 text-2xl font-bold text-[#1c3430] group-hover:text-white transition">
                  {service.title}
                </h3>

                <p className="mt-4 text-[#4b4c49] group-hover:text-gray-300 leading-relaxed transition">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* ================= STATS ================= */}

      <section className="py-16 lg:py-24 bg-[#1c3430]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              ["500+", "Happy Clients"],
              ["10+", "Years Experience"],
              ["100%", "Client Satisfaction"],
              ["24/7", "Support"],
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center border border-white/10 flex flex-col justify-center"
              >
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#dfc797]">
                  {item[0]}
                </h3>

                <p className="mt-2 sm:mt-3 text-white text-sm sm:text-base lg:text-lg">
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      < section id="about" className="py-24 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Image
                src="/about.jpg"
                alt="About Us"
                width={1000}
                height={700}
                className=""
              />
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1c3430]">
                About Us
              </h2>

              <div className="w-28 h-1 bg-[#dfc797] rounded-full mt-5"></div>

              <p className="mt-8 text-lg text-[#4b4c49] leading-relaxed">
                Ramkrushn Consultancy provides trusted consultancy services
                for loans, GST, income tax, accounting, insurance, and
                business management.
              </p>

              <p className="mt-5 text-lg text-[#4b4c49] leading-relaxed">
                Our mission is to simplify financial operations and help
                businesses grow with confidence and professional support.
              </p>

              <button
                className="mt-8 px-8 py-4 rounded-full bg-[#1c3430] text-[#dfc797] font-bold hover:bg-[#0f1f1c] transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section >

      {/* ================= FOOTER ================= */}

      < footer
        id="contact"
        className="bg-[#0d1715] text-white pt-20 pb-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* COMPANY */}

            <div>
              <div className="flex items-center justify-start gap-3">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-white">
                  <Image
                    src="/Ramkrishna.png"
                    alt="Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <p className="mt-6 text-gray-400 leading-relaxed">
                Trusted consultancy services for all financial and taxation
                solutions.
              </p>
            </div>

            {/* LINKS */}

            <div>
              <h3 className="text-xl font-bold text-[#dfc797] mb-6">
                Quick Links
              </h3>

              <ul className="space-y-4 text-gray-400">
                <li>
                  <a href="#home" className="hover:text-white transition">
                    Home
                  </a>
                </li>

                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>

                <li>
                  <a href="#about" className="hover:text-white transition">
                    About Us
                  </a>
                </li>

                <li>
                  <a href="#contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* SERVICES */}

            <div>
              <h3 className="text-xl font-bold text-[#dfc797] mb-6">
                Main Services
              </h3>

              <ul className="space-y-4 text-gray-400">
                <li>Home Loan</li>
                <li>Business Loan</li>
                <li>GST Services</li>
                <li>Income Tax Return</li>
                <li>Accounting</li>
              </ul>
            </div>

            {/* CONTACT */}

            <div>
              <h3 className="text-xl font-bold text-[#dfc797] mb-6">
                Contact Us
              </h3>

              <ul className="space-y-5 text-gray-400">
                <li>📍 338, Tulsi Arcade, Near Sudama Chow, Mota varaccha, Surat, Gujrat, India-394101</li>

                <li>📞 +91 83207 04550</li>

                <li>📧 ramkrishnaconsultancy28@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-14 pt-8 text-center text-gray-500">
            © {new Date().getFullYear()} Ramkrushn Consultancy. All Rights
            Reserved.
          </div>
        </div>
      </footer >
    </div >
  );
}