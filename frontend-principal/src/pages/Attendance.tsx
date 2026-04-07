import { useEffect, useState } from 'react';
import { Calendar, Users, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../lib/api';

interface ClassData {
  id:           string;
  name:         string;
  section:      string;
  grade:        string;
  studentCount: number;
}

interface Student {
  id:     string;
  name:   string;
  rollNo: string;
  classId?: string;
}

interface StudentsResponse {
  students?: Student[];
}

interface AttendanceResponse {
  attendance?: {
    isPresent: Record<string, boolean>;
  };
}

export default function Attendance() {
  const [classes,    setClasses]    = useState<ClassData[]>([]);
  const [selected,   setSelected]   = useState<ClassData | null>(null);
  const [students,   setStudents]   = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading,    setLoading]    = useState(true);
  const [marking,    setMarking]    = useState(false);
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get('/classes')
       .then((res) => setClasses(res.data.classes || []))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  const loadStudents = async (c: ClassData) => {
    setLoading(true);
    setSelected(c);
    try {
      const res = await api.get<StudentsResponse>('/students');
      const filtered = (res.data.students ?? []).filter((s) => s.classId === c.name);
      setStudents(filtered);
      
      // Load existing attendance
      const att = await api.get<AttendanceResponse>(`/attendance?classId=${c.id}&date=${date}`);
      if (att.data.attendance) {
        setAttendance(att.data.attendance.isPresent);
      } else {
        const initial: Record<string, boolean> = {};
        filtered.forEach((s: Student) => { initial[s.id] = true; });
        setAttendance(initial);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const save = async () => {
    if (!selected) return;
    setMarking(true);
    try {
      await api.post('/attendance', {
        classId:    selected.id,
        date:       date,
        isPresent:  attendance,
      });
      alert('Attendance saved successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save attendance.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-gray-500 mt-1">Daily presence tracking and historical records.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input 
                type="date" 
                className="text-sm font-semibold outline-none bg-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
           </div>
           {selected && (
             <button 
               onClick={save}
               disabled={marking}
               className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
             >
                {marking ? 'Saving...' : 'Save Record'}
             </button>
           )}
        </div>
      </header>

      {!selected ? (
        <div className="grid4">
           {loading ? (
             <div className="col-span-full py-24 text-center text-[var(--txt2)] font-medium">Fetching classes...</div>
           ) : classes.length === 0 ? (
             <div className="col-span-full py-24 text-center text-[var(--txt2)] font-medium">No classes configured.</div>
           ) : classes.map((c) => (
             <div 
               key={c.id} 
               onClick={() => loadStudents(c)}
               className="card p-5 cursor-pointer hover:-translate-y-1 transition-transform group"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className="av w-10 h-10 bg-[var(--bg3)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                      <Users className="w-5 h-5" />
                   </div>
                   <ChevronRight className="text-[var(--txt3)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
                <h3 className="font-bold text-[var(--txt)] text-lg leading-tight">{c.name}</h3>
                <p className="text-[var(--txt2)] mono text-xs mt-1 uppercase tracking-widest">{c.grade} · SECTION {c.section}</p>
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                   <span className="text-sm font-bold text-[var(--accent)]">{c.studentCount} Students</span>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="card w-full">
           <div className="card-header w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setSelected(null)}
                   className="btn btn-ghost px-2 py-2"
                 >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                 </button>
                 <div>
                    <h2 className="card-title">Attendance: {selected.name}</h2>
                    <p className="card-sub">{new Date(date).toDateString()}</p>
                 </div>
              </div>
           </div>

           <div className="table-wrap max-h-[60vh] overflow-y-auto">
              <table>
                 <thead className="sticky top-0 bg-[var(--bg2)] z-10">
                    <tr>
                       <th>Student Info</th>
                       <th>Roll No</th>
                       <th className="text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="group">
                         <td>
                            <div className="flex items-center gap-3">
                               <div className="av w-8 h-8 bg-[var(--bg3)] text-[var(--txt)] text-xs">
                                  {s.name[0]}
                               </div>
                               <span className="font-semibold text-[var(--txt)]">{s.name}</span>
                            </div>
                         </td>
                         <td className="mono text-[var(--txt2)]">{s.rollNo}</td>
                         <td>
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                 onClick={() => setAttendance(prev => ({ ...prev, [s.id]: true }))}
                                 className={`btn ${attendance[s.id] ? 'btn-green font-bold' : 'btn-ghost'}`}
                               >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Present
                               </button>
                               <button 
                                 onClick={() => setAttendance(prev => ({ ...prev, [s.id]: false }))}
                                 className={`btn ${!attendance[s.id] ? 'btn-danger font-bold' : 'btn-ghost'}`}
                               >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
