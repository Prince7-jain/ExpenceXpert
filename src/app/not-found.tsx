import React from "react";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <CircleDollarSign className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-6">
          Oops! We couldn&apos;t find that page.
        </p>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}