import { useState, useMemo } from 'react';
import { Calendar, Users, GraduationCap, UserRound, AlertTriangle } from 'lucide-react';
import { STUDENT_MOCK_DATA, TEACHER_MOCK_DATA, STAFF_MOCK_DATA } from '@/lib/mockData';

type PersonType = 'students' | 'teachers' | 'staff';

interface Person {
  id: string;
  name: string;
  meta: string;
  type: PersonType;
  classId?: string;
  section?: string;
  presentDays: number;
  totalWorkingDays: number;
}

function buildSample(): Person[] {
  const students: Person[] = STUDENT_MOCK_DATA.map(s => ({
    id: s.id,
    name: s.name,
    meta: `${s.classId} · ${s.section}`,
    type: 'students',
    classId: s.classId,
    section: s.section,
    presentDays: 0,
    totalWorkingDays: 1, // Start with Day 1: 0/1 as per example
  }));

  const teachers: Person[] = TEACHER_MOCK_DATA.map(t => ({
    id: t.id,
    name: t.name,
    meta: t.subject,
    type: 'teachers',
    presentDays: 0,
    totalWorkingDays: 1,
  }));

  const staff: Person[] = STAFF_MOCK_DATA.map(s => ({
    id: s.id,
    name: s.name,
    meta: s.work,
    type: 'staff',
    presentDays: 0,
    totalWorkingDays: 1,
  }));

  return [...students, ...teachers, ...staff];
}

const TAB_ICONS: Record<PersonType, React.ElementType> = {
  students: GraduationCap, teachers: UserRound, staff: Users,
};

const CLASSES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SECTIONS = ['A','B','C','D','E'];

export default function Attendance() {
  const [people, setPeople] = useState<Person[]>(buildSample());
  const [activeTab, setActiveTab] = useState<PersonType>('students');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const tabPeople = useMemo(() => {
    let list = people.filter(p => p.type === activeTab);
    if (activeTab === 'students') {
      if (filterClass) list = list.filter(p => p.classId === filterClass);
      if (filterSection) list = list.filter(p => p.section === filterSection);
    }
    return list;
  }, [people, activeTab, filterClass, filterSection]);

  const markPresent = (id: string) => {
    setPeople(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          presentDays: p.presentDays + 1,
          totalWorkingDays: p.totalWorkingDays + 1
        };
      }
      return p;
    }));
  };

  const simulateNextDay = () => {
    setPeople(prev => prev.map(p => ({
      ...p,
      totalWorkingDays: p.totalWorkingDays + 1
    })));
  };

  return (
    <div className="space-y-6 animate-element animate-delay-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-[var(--txt2)] mt-1">Present Days / Total Working Days.</p>
        </div>
        <button onClick={simulateNextDay} className="px-5 py-2.5 bg-[var(--accent)] text-black font-bold rounded-xl text-sm">
          Simulate Next Working Day
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg2)] border border-[var(--border)] p-1 rounded-xl w-fit">
        {(['students', 'teachers', 'staff'] as PersonType[]).map(t => {
          const Icon = TAB_ICONS[t];
          return (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
                ${activeTab === t ? 'bg-[var(--accent)] text-black shadow' : 'text-[var(--txt2)] hover:text-[var(--txt)]'}`}>
              <Icon className="w-4 h-4" />{t}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeTab === 'students' && (
          <>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)]">
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
              className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--txt)]">
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header items-center">
          <div>
            <div className="card-title capitalize">{activeTab}</div>
            <div className="card-sub">{tabPeople.length} people</div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>{activeTab === 'students' ? 'Class & Section' : 'Role'}</th>
                <th className="text-center">Action</th>
                <th className="text-center">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {tabPeople.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-[var(--txt3)]">No records found.</td>
                </tr>
              ) : (
                tabPeople.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="av w-8 h-8 bg-[var(--bg3)] text-[var(--txt)] text-xs font-bold">{p.name[0]}</div>
                        <span className="font-semibold text-[var(--txt)]">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-[var(--txt2)] text-xs mono">{p.meta}</td>
                    <td>
                      <div className="flex justify-center">
                         <button onClick={() => markPresent(p.id)}
                            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-emerald-500/30 transition-all">
                            Present
                         </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold mono text-[var(--accent)]">
                          {p.presentDays} / {p.totalWorkingDays}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
