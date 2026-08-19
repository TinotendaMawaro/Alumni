import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit3, Trash2 } from 'lucide-react';
import { getYearOptions } from '../utils/formatters';
import { PROGRAMS } from '../data/seedData';

const AlumniDirectory = ({ alumniList, onDelete, onEdit, onView, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredAlumni = useMemo(() => {
    return alumniList.filter(item => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        item.fullName?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.whatsapp?.toLowerCase().includes(search) ||
        item.employment?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search);

      const matchesProgram = !programFilter || item.program === programFilter;
      const matchesYear = !yearFilter || item.year === yearFilter;

      return matchesSearch && matchesProgram && matchesYear;
    });
  }, [alumniList, searchTerm, programFilter, yearFilter]);

  const handleDeleteConfirm = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone, employment..."
            className="input-field pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="input-field py-2 w-auto"
          >
            <option value="">All Programs</option>
            {PROGRAMS.map(p => (
              <option key={p} value={p}>{p.replace('Diploma in ', '').replace('Bachelor Degree in ', '')}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="input-field py-2 w-auto"
          >
            <option value="">All Years</option>
            {getYearOptions().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {(searchTerm || programFilter || yearFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setProgramFilter(''); setYearFilter(''); }}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition"
            >
              Reset
            </button>
          )}
        </div>

      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Program</th>
                <th className="px-5 py-3.5">Grad Year</th>
                <th className="px-5 py-3.5">Employment / Role</th>
                <th className="px-5 py-3.5">Reg Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredAlumni.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-800 text-yellow-400 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/40 flex-shrink-0">
                      {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div>{item.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.location || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-200 font-medium">{item.email}</div>
                    <a 
                      href={`https://wa.me/${item.whatsapp?.replace(/[^0-9+]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline text-[11px] inline-flex items-center gap-1 mt-0.5"
                    >
                      {item.whatsapp}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-1 bg-purple-950 text-purple-200 border border-purple-800 rounded-lg text-[11px]">
                      {item.program}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-yellow-400">
                    {item.year}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {item.employment}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-[11px]">
                    {item.createdAt || '2026-08-10'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => onView(item)}
                        className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition"
                        title="View Record Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Alumnus"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteConfirm(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete Alumnus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-slate-800">
          {filteredAlumni.map(item => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-800 text-yellow-400 font-bold text-xs flex items-center justify-center">
                    {item.fullName ? item.fullName.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.fullName}</h4>
                    <p className="text-[10px] text-slate-400">{item.location}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-purple-950 px-2.5 py-1 rounded-full border border-purple-800">
                  Class of {item.year}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <p className="text-purple-200 font-medium">{item.program}</p>
                <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Role:</strong> {item.employment}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-300 text-[11px]">{item.email}</span>
                  <a href={`https://wa.me/${item.whatsapp?.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-400 text-[11px]">
                    {item.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button 
                  onClick={() => onView(item)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button 
                  onClick={() => onEdit(item)}
                  className="px-3 py-1.5 bg-purple-900 text-purple-200 text-xs rounded-lg flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteConfirm(item.id)}
                  className="px-3 py-1.5 bg-rose-950 text-rose-300 text-xs rounded-lg flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Alumni Records Match Your Search</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or add a new entry.</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default AlumniDirectory;
