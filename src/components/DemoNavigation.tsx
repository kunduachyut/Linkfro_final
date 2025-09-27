import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoNavigation() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Component Demos</h2>
      <div className="flex flex-wrap gap-4">
        <Button asChild variant="outline">
          <Link href="/demo/multistep-form">Multi-Step Form</Link>
        </Button>
      </div>
    </div>
  );
}