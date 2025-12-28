import React from "react";
import { AlertTriangle } from "lucide-react";

export default function AnomalyAlert({ message }) {
  
  if (!message) return null;

  return (
   
    <div className="bg-red-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-md animate-fade-in">
     
      <AlertTriangle className="h-4 w-4" />

     
      <p className="text-sm font-medium tracking-tight">
        {message}
      </p>
    </div>
  );
}
