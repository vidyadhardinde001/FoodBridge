import { NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📩 Received Request Body:", body);

        const { action, username, email, password, healthIssues, allergies } = body;

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 });
        }

        if (action === "register") {
            if (!username || !email || !password) {
                return NextResponse.json(
                    { error: "Username, email, and password are required" },
                    { status: 400 }
                );
            }

            try {
                const user = await registerUser(
                    username,
                    email,
                    password,
                    healthIssues || [],
                    allergies || []
                );

                if (user && typeof user === "object" && "error" in user) {
                    throw new Error(String(user.error)); // ✅ Ensure it's a string
                }

                console.log("✅ User Registered:", user);
                return NextResponse.json({ message: "User registered successfully", user });
            } catch (error) {
                console.error("❌ Registration Error:", error);
                return NextResponse.json(
                    { error: error instanceof Error ? error.message : "Failed to register user" },
                    { status: 400 }
                );
            }
        } 
        
        if (action === "login") {
            if (!email || !password) {
                return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
            }

            try {
                const token = await loginUser(email, password);
                console.log("🔑 Login Successful - Token:", token);
                return NextResponse.json({ token });
            } catch (error) {
                console.error("❌ Login Error:", error);
                return NextResponse.json(
                    { error: error instanceof Error ? error.message : "Invalid credentials" },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("❌ Unexpected Server Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
