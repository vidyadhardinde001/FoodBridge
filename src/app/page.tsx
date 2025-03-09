"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import FoodProvider from "@/sections/FoodProvider";
import Login from "@/sections/Login";
import Charity from "@/sections/Charity";


import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      router.push(`/dashboard/${role}`);
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
    <Login/>
    </>
  );
}
