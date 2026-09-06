import { X } from 'lucide-react';
import { getYearOptions } from '../utils/formatters';

const EditAlumnusModal = ({ alumnus, onClose, onSave }) => {
  if (!alumnus) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      ...alumnus,
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp'),
      program: formData.get('program'),
      year: formData.get('year'),
      employment: formData.get('employment') || 'N/A',
      location: formData.get('location') || 'N/A',
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-900/80 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold font-mono text-white mb-4">
          {alumnus.id ? 'Edit Alumni Record' : 'Add New Alumnus Entry'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
            <input 
              type="text"
              name="fullName"
              required
              defaultValue={alumnus.fullName || ''}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
              <input 
                type="email"
                name="email"
                required
                defaultValue={alumnus.email || ''}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">WhatsApp Phone *</label>
              <input 
                type="tel"
                name="whatsapp"
                required
                defaultValue={alumnus.whatsapp || ''}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Program Studied *</label>
              <input
                type="text"
                name="program"
                required
                defaultValue={alumnus.program || ''}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Grad Year *</label>
              <select
                name="year"
                required
                defaultValue={alumnus.year || ''}
                className="input-field"
              >
                <option value="" disabled>Year</option>
                {getYearOptions().map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Current Role / Employer</label>
              <input 
                type="text"
                name="employment"
                defaultValue={alumnus.employment || ''}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">City / Location</label>
              <input 
                type="text"
                name="location"
                defaultValue={alumnus.location || ''}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-secondary"
            >
              Save Alumni Record
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditAlumnusModal;
