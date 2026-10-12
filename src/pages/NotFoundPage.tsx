import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-3xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-5xl shadow-neo-lg mb-6 transform -rotate-3">
        🤔
      </div>
      <h1 className="text-4xl font-black font-display text-black mb-2">
        404 — Are Bhai, Kahan Aa Gaye?
      </h1>
      <p className="text-sm font-bold text-neutral-600 max-w-md mb-6">
        This page doesn't exist or might have been settled and deleted. Let's head back to the main dashboard.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="lg">
          Back to Hisaab Dashboard 🏠
        </Button>
      </Link>
    </div>
  );
};
