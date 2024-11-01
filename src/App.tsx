import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { MultiStepForm } from './components/MultiStepForm';
import { About } from './components/About';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { LoginPage } from './components/admin/LoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { CompanyList } from './components/admin/CompanyList';
import { DownloadButton } from './components/DownloadButton';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}

function HomePage() {
  const formRef = React.useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Hero onGetStarted={scrollToForm} />
        <Benefits />
        <div ref={formRef} className="py-24 bg-blue-900" id="benchmark-form">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Start dit benchmark</h2>
              <p className="mt-4 text-lg text-blue-100">
                Udfyld formularen nedenfor for at modtage din gratis benchmark-rapport
              </p>
            </div>
            <MultiStepForm />
          </div>
        </div>
        <About />
        <FAQ />
        <Contact />
        <Footer />
      </div>
      <DownloadButton />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CompanyList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}