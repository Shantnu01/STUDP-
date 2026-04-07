import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

interface Student {
  id:      string;
  name:    string;
  rollNo:  string;
  classId: string;
  section: string;
  status:  'active' | 'inactive';
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/students')
       .then((res) => setStudents(res.data.students || []))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-gray-500 mt-1">Manage your student records and enrollments.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
           <Plus className="w-5 h-5" />
           Add Student
        </button>
      </header>

      <div className="card w-full">
         <div className="card-header w-full border-b border-[var(--border)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="search-wrap w-full max-w-sm">
               <Search />
               <input 
                 type="text" 
                 placeholder="Search by name or roll number..." 
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

         <div className="table-wrap">
            <table>
               <thead>
                  <tr>
                     {[...['Name', 'Roll No', 'Class', 'Section', 'Status'].map(h => <th key={h}>{h}</th>), <th key="Actions" className="text-right">Actions</th>]}
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400">Loading students...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400">No students found.</td></tr>
                  ) : filtered.map((s) => (
                    <tr key={s.id} className="group">
                       <td>
                          <div className="flex items-center gap-3">
                             <div className="av w-8 h-8 bg-[var(--bg3)] text-[var(--txt)] text-xs">
                                {s.name[0]}
                             </div>
                             <span className="font-semibold">{s.name}</span>
                          </div>
                       </td>
                       <td className="mono text-[var(--txt2)]">{s.rollNo}</td>
                       <td className="font-medium text-[var(--txt)]">{s.classId}</td>
                       <td className="text-[var(--txt)]">{s.section}</td>
                       <td>
                          <span className={`badge shrink-0 ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                             {s.status}
                          </span>
                       </td>
                       <td className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="btn btn-ghost btn-sm">
                                <Edit className="w-3.5 h-3.5" />
                             </button>
                             <button className="btn btn-danger btn-sm">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
