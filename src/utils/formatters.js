export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const exportToCSV = (alumniList) => {
  if (!alumniList || alumniList.length === 0) return null;

  const headers = ["Full Name", "Email Address", "WhatsApp Phone", "Program Studied", "Graduation Year", "Employment", "Location", "Terms Consent", "Reg Date"];
  const rows = alumniList.map(a => [
    `"${(a.fullName || '').replace(/"/g, '""')}"`,
    `"${(a.email || '').replace(/"/g, '""')}"`,
    `"${(a.whatsapp || '').replace(/"/g, '""')}"`,
    `"${(a.program || '').replace(/"/g, '""')}"`,
    `"${a.year || ''}"`,
    `"${(a.employment || '').replace(/"/g, '""')}"`,
    `"${(a.location || '').replace(/"/g, '""')}"`,
    `"${a.termsAccepted ? 'Accepted' : 'Pending'}"`,
    `"${a.createdAt || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  return encodedUri;
};

export const downloadCSV = (alumniList, filename = 'alumni_directory') => {
  const csvData = exportToCSV(alumniList);
  if (!csvData) return false;
  
  const link = document.createElement("a");
  link.setAttribute("href", csvData);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

export const getInitials = (name) => {
  if (!name) return 'S';
  return name.charAt(0).toUpperCase();
};

export const getYearOptions = () => {
  const current = new Date().getFullYear();
  const yrs = [];
  for (let y = current; y >= 1980; y--) {
    yrs.push(y.toString());
  }
  return yrs;
};
