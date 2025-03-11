// verify/[id]/page.tsx

"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';


export default function VerifyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already_picked'>('verifying');

  useEffect(() => {
    const verifyPickup = async () => {
      const token = searchParams.get('token');
      try {
        const res = await fetch(`/api/food/${params.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'picked_up' })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard/provider?verified=true');
          }, 3000);
        } else if (data.error === 'This food has already been picked up') {
          setStatus('already_picked');
          setTimeout(() => router.push('/dashboard/provider'), 5000);
        } else {
          const data = await res.json();
          console.error('Verification failed:', data.error);
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
      }
    };

    verifyPickup();
  }, [params.id, router,searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'verifying' && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Verifying Pickup...</h2>
            <p>Please wait while we verify your pickup request.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Pickup Verified!</h2>
            <p>You will be redirected to your dashboard shortly.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p>Please try again or contact support.</p>
          </>
        )}
        {status === 'already_picked' && (
          <>
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Already Collected!</h2>
            <p>This food donation has already been picked up by someone else.</p>
            <p className="mt-2 text-sm">Redirecting to dashboard in 5 seconds...</p>
          </>
        )}
      </div>
    </div>
  );
}