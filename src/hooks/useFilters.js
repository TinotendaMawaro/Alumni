import { useMemo } from 'react';

export const useAlumniFilters = (alumniList, searchTerm, programFilter, yearFilter) => {
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

  return filteredAlumni;
};

export const useAlumniStats = (alumniList) => {
  return useMemo(() => {
    const total = alumniList.length;
    const programsCount = new Set(alumniList.map(a => a.program)).size;
    const recentGrads = alumniList.filter(a => ['2024', '2025', '2026'].includes(a.year)).length;
    
    const counts = {};
    alumniList.forEach(a => {
      if (a.program) counts[a.program] = (counts[a.program] || 0) + 1;
    });
    let topProg = 'N/A';
    let max = 0;
    Object.entries(counts).forEach(([p, c]) => {
      if (c > max) { max = c; topProg = p; }
    });

    return { 
      total, 
      programsCount, 
      recentGrads, 
      topProg: topProg.replace('Diploma in ', '').replace('Bachelor Degree in ', '') 
    };
  }, [alumniList]);
};
