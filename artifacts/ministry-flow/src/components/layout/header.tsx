import { Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <h1 className="text-2xl font-serif text-slate-800">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <Link href="/documents/new" className="inline-flex">
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Register Document
          </Button>
        </Link>
      </div>
    </header>
  );
}
