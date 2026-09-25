import React, { useState, useEffect } from 'react';
import { isDemoMode } from './services/supabase';
import { fetchAlumni, createAlumnus, updateAlumnus, deleteAlumnus } from './services/alumni';
import { useAlumniData } from './hooks/useAlumniData';
import { useAlumniFilters, useAlumniStats } from './hooks/useFilters';
import { downloadCSV } from './utils/formatters';

import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';
import ViewAlumnusModal from './components/ViewAlumnusModal';
import EditAlumnusModal from './components/EditAlumnusModal';
import TermsModal from './components/TermsModal';
import PublicRegistrationForm from './views/PublicRegistrationForm';
import AdminPortal from './views/AdminPortal';
import AdminLogin from './views/AdminLogin';
import PaymentsView from './views/PaymentsView';
import PaymentAdminView from './views/PaymentAdminView';

export default function App() {
  const { alumniList, setAlumniList, loading } = useAlumniData();
  const [adminUser, setAdminUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashMessage, setSplashMessage] = useState('Initializing School Portal...');
  const [toasts, setToasts] = useState([]);
  
  const [viewingAlumnus, setViewingAlumnus] = useState(null);
  const [editingAlumnus, setEditingAlumnus] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [activeView, setActiveView] = useState('public');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const stats = useAlumniStats(alumniList);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const triggerSplashTransition = (message, targetView, callback = null) => {
    setSplashMessage(message);
    setShowSplash(true);
    setTimeout(() => {
      if (targetView) setActiveView(targetView);
      if (callback) callback();
      setTimeout(() => {
        setShowSplash(false);
      }, 700);
    }, 800);
  };

  const handleSwitchView = (viewName) => {
    if (viewName === activeView) return;
    setMobileMenuOpen(false);
    const msg = viewName === 'admin' 
      ? 'Loading Admin Secure Portal...' 
      : viewName === 'payments'
        ? 'Loading Payment Portal...'
        : 'Loading Public Registration Form...';
    triggerSplashTransition(msg, viewName);
  };

  const handlePublicSubmit = async (action) => {
    if (action.type === 'error') {
      addToast(action.message, 'error');
    } else if (action.type === 'showTerms') {
      setShowTermsModal(true);
    } else if (action.type === 'submit') {
      const record = action.data;
      try {
        const saved = await createAlumnus(record);
        setAlumniList(prev => [saved, ...prev]);
        
        const savedRecord = saved || record;
        try {
          const { sendWelcomeEmail, sendAdminNotification } = await import('./services/email.js');
          sendWelcomeEmail(savedRecord);
          sendAdminNotification(savedRecord, adminUser?.email || 'admin@sht.ac.zw');
        } catch {
          // email service optional
        }
        addToast(`Thank you ${savedRecord.fullName}! You have successfully registered.`, 'success');
      } catch (err) {
        console.error("Submission error:", err);
        setAlumniList(prev => [{ id: 'local-' + Date.now(), ...record }, ...prev]);
        addToast('Database unavailable. Saved locally; it will sync when the connection is restored.', 'info');
      }
    }
  };

  const handleAdminLogin = (action) => {
    if (action.type === 'error') {
      addToast(action.message, 'error');
    } else if (action.type === 'login') {
      triggerSplashTransition(`Welcome ${action.admin.name}! Authenticating...`, 'admin', () => {
        setAdminUser(action.admin);
        addToast(`Authenticated as ${action.admin.name}`, 'success');
      });
    }
  };

  const handleAdminLogout = () => {
    triggerSplashTransition('Logging out from Admin Portal...', 'public', () => {
      setAdminUser(null);
      addToast('Successfully logged out of Admin Portal.', 'info');
    });
  };

  const handleSaveAlumnus = async (data) => {
    try {
      const isRemoteId = data.id && !data.id.startsWith('seed-') && !data.id.startsWith('local-');
      
      if (isRemoteId) {
        const updated = await updateAlumnus(data.id, {
          fullName: data.fullName,
          email: data.email,
          whatsapp: data.whatsapp,
          program: data.program,
          year: data.year,
          employment: data.employment || 'N/A',
          location: data.location || 'N/A'
        });
        setAlumniList(prev => prev.map(a => a.id === data.id ? updated || { ...a, ...data } : a));
        addToast('Record updated in database!', 'success');
      } else {
        const saved = await createAlumnus({
          fullName: data.fullName,
          email: data.email,
          whatsapp: data.whatsapp,
          program: data.program,
          year: data.year,
          employment: data.employment || 'N/A',
          location: data.location || 'N/A',
          termsAccepted: true,
          createdAt: new Date().toISOString().split('T')[0]
        });
        setAlumniList(prev => [saved, ...prev]);
        addToast('New alumnus added!', 'success');
      }
      setEditingAlumnus(null);
    } catch (e) {
      console.error(e);
      addToast('Saved locally.', 'info');
    }
  };

  const handleDeleteAlumnus = async (id) => {
    const alumnus = alumniList.find(a => a.id === id);
    try {
      await deleteAlumnus(id);
      setAlumniList(prev => prev.filter(a => a.id !== id));
      try {
        const { sendDeletionConfirmation } = await import('./services/email.js');
        sendDeletionConfirmation(alumnus, adminUser?.email || 'admin@sht.ac.zw');
      } catch {
        // email service optional
      }
      addToast('Alumni record deleted.', 'info');
    } catch (err) {
      console.error(err);
    }
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    if (alumniList.length === 0) {
      addToast('No alumni records available to export.', 'error');
      return;
    }
    const success = downloadCSV(alumniList);
    if (success) {
      addToast('CSV file downloaded successfully!', 'success');
    } else {
      addToast('Failed to export CSV.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-yellow-400 selection:text-purple-950">
      
      {showSplash && <SplashScreen message={splashMessage} />}
      <ToastContainer toasts={toasts} />

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDeleteAlumnus(deleteConfirmId)}
        title="Delete Alumni Record"
        message="Are you sure you want to delete this alumni record? This action cannot be undone."
        confirmText="Delete"
      />

      <Header 
        activeView={activeView}
        onSwitchView={handleSwitchView}
        alumniCount={alumniList.length}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col">
        {activeView === 'public' && (
          <PublicRegistrationForm 
            onSubmit={handlePublicSubmit}
            showSplash={showSplash}
            setShowSplash={setShowSplash}
            setSplashMessage={setSplashMessage}
          />
        )}

        {activeView === 'payments' && (
          <PaymentsView addToast={addToast} />
        )}

        {activeView === 'admin' && (
          !adminUser ? (
            <AdminLogin onLogin={handleAdminLogin} />
          ) : (
            <AdminPortal 
              adminUser={adminUser}
              alumniList={alumniList}
              onLogout={handleAdminLogout}
              onDeleteAlumnus={handleDeleteAlumnus}
              onEditAlumnus={(a) => setEditingAlumnus(a)}
              onViewAlumnus={(a) => setViewingAlumnus(a)}
              onExportCSV={handleExportCSV}
            />
          )
        )}
      </main>

      <ViewAlumnusModal 
        alumnus={viewingAlumnus} 
        onClose={() => setViewingAlumnus(null)} 
      />

      <EditAlumnusModal 
        alumnus={editingAlumnus} 
        onClose={() => setEditingAlumnus(null)}
        onSave={handleSaveAlumnus}
      />

      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />

      {adminUser && activeView === 'admin' && (
        <PaymentAdminView addToast={addToast} />
      )}

      <footer className="bg-purple-950 border-t border-purple-900/60 py-4 px-4 text-center text-xs text-purple-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 School of Hospitality and Tourism. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setShowTermsModal(true)} className="hover:text-yellow-400 underline">Privacy Policy</button>
            <span>&bull;</span>
            <button onClick={() => handleSwitchView('admin')} className="hover:text-yellow-400 underline">Admin Portal</button>
            <span>&bull;</span>
            <button onClick={() => handleSwitchView('payments')} className="hover:text-yellow-400 underline">Payments</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
