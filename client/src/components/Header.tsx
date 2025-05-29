import { Link } from "wouter";
import { Search, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="font-bold text-2xl text-primary">ShiftPlanner</a>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/">
              <a className="text-primary font-medium">Dashboard</a>
            </Link>
            <a href="/notificaciones" className="text-[#2C3E50] hover:text-primary">Notificaciones</a>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-8 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <span className="flex bg-primary/10 text-primary rounded-full px-3 py-1 text-sm items-center">
            <UserCircle className="h-4 w-4 mr-1" /> Admin
          </span>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
            <span>AS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
