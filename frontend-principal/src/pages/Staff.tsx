import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '../lib/api';

interface Staff {
  id:         string;
  name:       string;
  role:       string;
  department: string;
  email:      string;
  phone:      string;
  status:     'active' | 'inactive';
}

export default function Staff() {
  const [staff,   setStaff]   = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/staff')
       .then((res) => setStaff(res.data.staff || []))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Faculty</h1>
          <p className="text-gray-500 mt-1">Manage your teachers, administrators, and support staff.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
           <Plus className="w-5 h-5" />
           Add Staff Member
        </button>
      </header>

      <div className="card w-full">
         <div className="card-header w-full border-b border-[var(--border)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="search-wrap w-full max-w-sm">
               <Search />
               <input 
                 type="text" 
                 placeholder="Search by name or role..." 
                 className="search-input text-white"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2">
               <button className="btn btn-ghost">
                  <Filter className="w-4 h-4" />
                  Filter
               </button>
            </div>
         </div>

         <div className="grid3 p-4">
            {loading ? (
              <div className="col-span-full py-24 text-center text-[var(--txt2)] font-medium">Loading staff records...</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-24 text-center text-[var(--txt2)] font-medium">No staff members found.</div>
            ) : filtered.map((s) => (
              <div key={s.id} className="card p-5 group">
                 <div className="flex items-start justify-between mb-4">
                    <div className="av w-10 h-10 bg-[var(--bg3)] text-[var(--txt)]">
                       {s.name[0]}
                    </div>
                    <span className={`badge shrink-0 ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                       {s.status}
                    </span>
                 </div>
                 <h3 className="font-bold text-[var(--txt)] text-lg leading-tight">{s.name}</h3>
                 <p className="text-[var(--accent)] text-sm font-semibold mt-1 uppercase tracking-wider">{s.role}</p>
                 <p className="text-[var(--txt2)] text-xs mt-1">{s.department}</p>
                 
                 <div className="mt-4 space-y-2 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[var(--txt2)] hover:text-[var(--txt)] transition-colors cursor-pointer group/item">
                       <Mail className="w-3.5 h-3.5" />
                       <span className="text-xs font-medium truncate">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--txt2)] hover:text-[var(--txt)] transition-colors cursor-pointer group/item">
                       <Phone className="w-3.5 h-3.5" />
                       <span className="text-xs font-medium truncate">{s.phone}</span>
                    </div>
                 </div>

                 <div className="mt-5 flex gap-2">
                    <button className="btn btn-ghost flex-1 justify-center text-xs">Edit Profile</button>
                    <button className="btn btn-danger px-3">
                       <Trash2 className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
