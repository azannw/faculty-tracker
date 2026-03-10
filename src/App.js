import React, { useEffect, useMemo, useState, useDeferredValue, memo, useCallback } from 'react';
import { Building2, Check, ChevronDown, Copy, Mail, MapPin, Phone, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { facultyDirectory, schoolOptions } from './data/facultyDirectory';
import { searchFaculty } from './utils/search';
import Footer from './components/Footer';

const getInitials = (name) => {
  const parts = name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/i, '').split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
};

const FacultyCard = memo(({ facultyMember, copiedEmailId, onCopyEmail }) => {
  const isCopied = copiedEmailId === facultyMember.id;
  const initials = getInitials(facultyMember.name);

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="truncate text-base font-bold text-slate-900" title={facultyMember.name}>
              {facultyMember.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-2" title={facultyMember.designation}>
              {facultyMember.designation}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {facultyMember.department}
          </span>
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 border border-slate-200">
            {facultyMember.schoolLabel}
          </span>
        </div>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-600"><span className="font-medium text-slate-900">Office:</span> {facultyMember.office || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Phone size={16} className="mt-0.5 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-600"><span className="font-medium text-slate-900">Extension:</span> {facultyMember.extension || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Mail size={16} className="mt-0.5 text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-600 truncate" title={facultyMember.email || 'N/A'}>
                <span className="font-medium text-slate-900">Email:</span> {facultyMember.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onCopyEmail(facultyMember)}
            disabled={!facultyMember.email}
            className={`flex-1 inline-flex justify-center items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              !facultyMember.email
                ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
                : isCopied
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? 'Copied' : 'Copy Email'}
          </button>
          <a
            href={facultyMember.email ? `mailto:${facultyMember.email}` : undefined}
            className={`flex-1 inline-flex justify-center items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !facultyMember.email
                ? 'pointer-events-none bg-slate-100 text-slate-400'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Mail size={14} />
            Email
          </a>
        </div>
      </div>
    </motion.article>
  );
});

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [copiedEmailId, setCopiedEmailId] = useState('');

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredSchoolFilter = useDeferredValue(schoolFilter);
  const deferredDepartmentFilter = useDeferredValue(departmentFilter);

  const departmentOptions = useMemo(() => {
    const matching =
      deferredSchoolFilter === 'all'
        ? facultyDirectory
        : facultyDirectory.filter((f) => f.school === deferredSchoolFilter);
    return [...new Set(matching.map((f) => f.department))].sort();
  }, [deferredSchoolFilter]);

  useEffect(() => {
    if (departmentFilter !== 'all' && !departmentOptions.includes(departmentFilter)) {
      setDepartmentFilter('all');
    }
  }, [departmentFilter, departmentOptions]);

  const filteredFaculty = useMemo(
    () => searchFaculty(facultyDirectory, deferredSearchQuery, deferredSchoolFilter, deferredDepartmentFilter),
    [deferredSearchQuery, deferredSchoolFilter, deferredDepartmentFilter],
  );

  const totalCount = facultyDirectory.length;
  const deptCount = useMemo(() => new Set(facultyDirectory.map((f) => f.department)).size, []);

  const shouldShowResults =
    Boolean(deferredSearchQuery.trim()) || deferredSchoolFilter !== 'all' || deferredDepartmentFilter !== 'all';

  const hasActiveFilters = searchQuery || schoolFilter !== 'all' || departmentFilter !== 'all';

  const handleCopyEmail = useCallback(async (facultyMember) => {
    if (!facultyMember.email || !navigator.clipboard?.writeText) return;
    setCopiedEmailId(facultyMember.id);
    await navigator.clipboard.writeText(facultyMember.email);
    window.setTimeout(() => setCopiedEmailId(''), 1600);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSchoolFilter('all');
    setDepartmentFilter('all');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-200">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
              <Building2 size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">FAST Faculty</h1>
            </div>
          </div>
          <div className="hidden sm:block text-sm font-medium text-slate-500">
            {totalCount} Records
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, department, office, or extension..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {schoolFilter !== 'all' && (
              <div className="relative sm:w-64 shrink-0">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 appearance-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {schoolOptions.map((school) => {
              const isActive = schoolFilter === school.value;
              return (
                <button
                  key={school.value}
                  onClick={() => setSchoolFilter(school.value)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {school.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                {filteredFaculty.length} Result{filteredFaculty.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!shouldShowResults ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Faculty Directory
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  Search across all FAST NUCES Islamabad departments. Get instant access to office locations, phone extensions, and email addresses.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Total Faculty</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{deptCount}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Departments</p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">4</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Schools</p>
                </div>
              </div>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 px-6 text-center shadow-sm">
              <Search size={32} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No faculty found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                We couldn't find anyone matching your search criteria. Try adjusting your filters or search term.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredFaculty.map((facultyMember) => (
                  <FacultyCard
                    key={facultyMember.id}
                    facultyMember={facultyMember}
                    copiedEmailId={copiedEmailId}
                    onCopyEmail={handleCopyEmail}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer darkMode={false} />
    </div>
  );
}

export default App;
