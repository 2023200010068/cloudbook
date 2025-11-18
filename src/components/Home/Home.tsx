"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cb_auth");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <main className="bg-black text-white">
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              height={1000}
              width={1000}
              src="/images/logo.webp"
              alt="CB"
              className="h-8 w-8"
            />
            <span className="text-white text-lg font-bold">CloudBook</span>
          </Link>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-primary-500 hover:bg-primary-600 text-white hover:bg-white hover:text-black text-sm font-medium py-1 px-4 border rounded transition duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="bg-primary-500 hover:bg-primary-600 text-white hover:bg-white hover:text-black text-sm font-medium py-1 px-4 border rounded transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <header
        className="relative bg-cover bg-center bg-no-repeat py-16"
        style={{
          backgroundImage: "url('/images/home/hero-bg.jpg')",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 relative z-10 text-center lg:text-left md:pt-12 pt-6 md:pb-12 pb-0">
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center gap-5">
            <div className="flex flex-col">
              <h1 className="md:text-[55px] text-[30px] leading-tight tracking-wide font-bold mb-4">
                The Retail Business Management Software...
              </h1>
              <p className="sm:text-xl text-gray-300 mb-6">
                CloudBook is the inventory management software, offering a complete ERP solution to streamline your
                operations, increase efficiency, and drive growth for your
                retail or wholesale business.
              </p>
              <div className="flex justify-center lg:justify-start gap-4 md:mt-10">
                <Link
                  href="/auth/login"
                  className="bg-[#6366F1] hover:bg-[#4044EE] text-white py-2 px-6 rounded-lg shadow-lg text-lg transition duration-300"
                >
                  Start now
                </Link>
                <Link
                  href="https://seu.edu.bd/"
                  className="border-2 border-white hover:bg-white text-white hover:text-black py-2 px-6 rounded-lg text-lg transition duration-300"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image
                height={1000}
                width={1000}
                src="/images/home/layer01.png"
                alt="Crypto Card"
                className="z-10"
              />
              <div className="absolute top-0 left-0">
                <Image
                  height={1000}
                  width={1000}
                  src="/images/home/layer02.png"
                  alt="Crypto Detail"
                  className="z-20"
                />
              </div>
              <div className="absolute top-0 left-0">
                <Image
                  height={1000}
                  width={1000}
                  src="/images/home/layer03.png"
                  alt="Crypto Bubble"
                  className="z-30"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[url('/images/home/blob.png')] bg-contain bg-center bg-no-repeat py-12 px-6 md:py-80 md:px-10 lg:px-16 text-white">
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="md:text-[45px] text-[25px] leading-tight tracking-wide text-center font-bold mb-10">
                Let’s start your investing easier now!
              </h2>
              <p className="mb-5">
                Write your email address so we can contact you
              </p>

              <form className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-screen-md mx-auto">
                <div className="relative sm:w-auto flex-grow">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 12l-4-4-4 4m8 0v8H8v-8"
                      ></path>
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="pl-10 pr-4 py-5 w-full rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#6366F1] hover:bg-[#4044EE] text-white font-semibold md:py-5 py-2 px-6 md:w-auto w-full rounded-md transition duration-300"
                >
                  Get in touch
                </button>
              </form>
              <p className="text-gray-500 text-sm mt-6">
                No subscriptions. No annual fees. No lock-ins.
              </p>

              <Link
                href="/auth/login"
                className="inline-block w-full sm:w-auto text-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-lg px-6 py-3 mt-10 rounded-lg shadow-lg transition"
              >
                Start now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="text-white py-12 px-6 md:px-20 bg-cover bg-no-repeat bg-top"
        style={{
          backgroundImage: "url('/images/home/cta-bg.jpg')",
        }}
      >
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                height={1000}
                width={1000}
                src="/images/logo.webp"
                alt="Silicon"
                className="h-10 w-10"
              />
              <span className="text-[30px] font-bold">CloudBook</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The leading provider of ERP solutions and inventory management
              software. Our sales and inventory management
              software helps retailers and wholesalers streamline operations and
              grow their businesses.
            </p>
            <div className="sm:flex items-center gap-5 mt-3 hidden">
              <Link
                href={"https://www.facebook.com/"}
                className="text-sm font-bold"
              >
                Facebook
              </Link>
              •
              <Link
                href={"https://www.instagram.com/"}
                className="text-sm font-bold"
              >
                Instagram
              </Link>
              •
              <Link
                href={"https://www.youtube.com/"}
                className="text-sm font-bold"
              >
                Youtube
              </Link>
              •
              <Link
                href={
                  "https://www.linkedin.com/"
                }
                className="text-sm font-bold"
              >
                LinkedIn
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
            <div className="flex flex-col gap-2">
              <h4 className="text-[25px] font-bold mb-2">Navigation</h4>
              <Link
                href={"/"}
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Home
              </Link>
              <Link
                href={"/auth/login"}
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Login
              </Link>
              <Link
                href={"/auth/sign-up"}
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Sign Up
              </Link>
              <Link
                href={"/auth/employee-login"}
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Employee login
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-[25px] font-bold mb-2">Contact Us</h4>
              <p className="text-gray-400">
                252, Tejgaon Industrial Area, Dhaka-1208, Bangladesh.
              </p>
              <p className="text-gray-400">info@cloudbook.com</p>
              <p className="text-gray-400">+880 1521-583066</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          © All rights reserved 2025 CloudBook • The Retail Business Management Software • Made by
          <span
            className="font-semibold text-white italic ml-1"
          >
            DevTeam
          </span>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
