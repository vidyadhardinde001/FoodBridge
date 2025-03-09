"use client";
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-green-600 mb-8">FoodBridge Registration</h1>
      <div className="space-y-4">
        <button
          onClick={() => router.push('/register/provider')}
          className="w-64 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
        >
          Register as Provider
        </button>
        <button
          onClick={() => router.push('/register/charity')}
          className="w-64 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Register as Charity
        </button>
      </div>
      <p className="mt-8">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-green-600 hover:underline"
        >
          Login here
        </a>
      </p>
    </div>
  );
}