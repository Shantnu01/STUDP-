/**
 * usePrincipalStats — Fetches live counts for the Principal Dashboard.
 * Uses the same API endpoints that the Students/Teachers/Staff pages use,
 * so the dashboard KPIs always reflect real Firestore data.
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export interface PrincipalStats {
  totalStudents: number;
  activeTeachers: number;
  totalStaff: number;
  pendingFees: number;  // students whose feeStatus !== 'Paid'
  boysCount: number;
  girlsCount: number;
  loading: boolean;
}

export function usePrincipalStats(): PrincipalStats {
  const { profile } = useAuthStore();
  const schoolId = profile?.schoolId;

  const [stats, setStats] = useState<PrincipalStats>({
    totalStudents: 0,
    activeTeachers: 0,
    totalStaff: 0,
    pendingFees: 0,
    boysCount: 0,
    girlsCount: 0,
    loading: true,
  });

  useEffect(() => {
    if (!schoolId) return;

    let cancelled = false;

    async function load() {
      try {
        const [studentsRes, teachersRes, staffRes, feesRes] = await Promise.allSettled([
          api.get(`/api/students?schoolId=${schoolId}`),
          api.get(`/api/teachers?schoolId=${schoolId}`),
          api.get(`/api/staff?schoolId=${schoolId}`),
          api.get(`/api/fees?schoolId=${schoolId}`),
        ]);

        if (cancelled) return;

        const students: any[] = studentsRes.status === 'fulfilled'
          ? (studentsRes.value.data?.students ?? studentsRes.value.data ?? [])
          : [];
        const teachers: any[] = teachersRes.status === 'fulfilled'
          ? (teachersRes.value.data?.teachers ?? teachersRes.value.data ?? [])
          : [];
        const staff: any[] = staffRes.status === 'fulfilled'
          ? (staffRes.value.data?.staff ?? staffRes.value.data ?? [])
          : [];
        const fees: any[] = feesRes.status === 'fulfilled'
          ? (feesRes.value.data?.fees ?? feesRes.value.data ?? [])
          : [];

        const pending = fees.filter((f: any) => f.feeStatus && f.feeStatus !== 'Paid').length;
        const boysCount = students.filter((s: any) => s.gender && s.gender.toLowerCase() === 'male').length;
        const girlsCount = students.filter((s: any) => s.gender && s.gender.toLowerCase() === 'female').length;

        setStats({
          totalStudents: students.length,
          activeTeachers: teachers.filter((t: any) => t.status === 'Active' || !t.status).length,
          totalStaff: staff.length,
          pendingFees: pending,
          boysCount,
          girlsCount,
          loading: false,
        });
      } catch {
        if (!cancelled) setStats(s => ({ ...s, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [schoolId]);

  return stats;
}
