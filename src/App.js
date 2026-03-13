import React, { useEffect, useMemo, useState, useDeferredValue, memo, useCallback } from 'react';
import { Building2, Check, ChevronDown, Copy, Mail, MapPin, Phone, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { facultyDirectory, schoolOptions } from './data/facultyDirectory';
import { searchFaculty } from './utils/search';
import Footer from './components/Footer';

const SHORT_LABELS = {
  all: 'All',
  computing: 'Computing',
  engineering: 'Engineering',
  business: 'Business',
  humanities: 'Sciences',
};

const FacultyCard = memo(({ facultyMember, copiedEmailId, onCopyEmail }) => {
  const isCopied = copiedEmailId === facultyMember.id;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col rounded-2xl bg-zinc-800 p-5"
    >
      <div className="flex-1">
        <h3 className="truncate text-base font-semibold text-white" title={facultyMember.name}>
          {facultyMember.name}
        </h3>
        <p className="mt-0.5 text-sm text-zinc-400 line-clamp-1" title={facultyMember.designation}>
          {facultyMember.designation}
        </p>
        <p className="mt-1 text-xs text-zinc-500 truncate">
          {facultyMember.department} · {facultyMember.schoolLabel}
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-zinc-500 shrink-0" />
          <span className="text-sm font-medium text-zinc-200 truncate">{facultyMember.office || '—'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-zinc-500 shrink-0" />
          {facultyMember.email ? (
            <a href={`mailto:${facultyMember.email}`} className="text-sm text-blue-400 truncate hover:text-blue-300 transition-colors" title={facultyMember.email}>
              {facultyMember.email}
            </a>
          ) : (
            <span className="text-sm text-zinc-600">—</span>
          )}
        </div>
        {facultyMember.extension && (
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-400">Ext {facultyMember.extension}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-700/40 flex gap-2.5">
        <button
          type="button"
          onClick={() => onCopyEmail(facultyMember)}
          disabled={!facultyMember.email}
          className={`flex-1 inline-flex justify-center items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150 ${
            !facultyMember.email
              ? 'cursor-not-allowed bg-zinc-700/30 text-zinc-600'
              : isCopied
                ? 'bg-green-500/10 text-green-400'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white active:scale-[0.98]'
          }`}
        >
          {isCopied ? <Check size={15} /> : <Copy size={15} />}
          {isCopied ? 'Copied' : 'Copy Email'}
        </button>
        <a
          href={facultyMember.email ? `mailto:${facultyMember.email}` : undefined}
          className={`flex-1 inline-flex justify-center items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150 ${
            !facultyMember.email
              ? 'pointer-events-none bg-zinc-700/30 text-zinc-600'
              : 'bg-blue-500 text-white hover:bg-blue-400 active:scale-[0.98]'
          }`}
        >
          <Mail size={15} />
          Email
        </a>
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
    const id = facultyMember.id;
    setCopiedEmailId(id);
    await navigator.clipboard.writeText(facultyMember.email);
    window.setTimeout(() => {
      setCopiedEmailId((prev) => (prev === id ? '' : prev));
    }, 1600);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSchoolFilter('all');
    setDepartmentFilter('all');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col font-sans selection:bg-blue-500/20">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-500" />
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-none">
              FAST Faculty
            </h1>
          </div>
          <span className="text-sm text-zinc-500">
            {totalCount} faculty
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 sm:mb-8 space-y-2.5 sm:space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty..."
                className="w-full rounded-xl bg-zinc-800 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 border border-zinc-700/40 focus:border-zinc-600 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {schoolFilter !== 'all' && (
              <div className="relative sm:w-56 shrink-0">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full rounded-xl bg-zinc-800 py-2.5 pl-3.5 pr-10 text-sm font-medium text-zinc-400 border border-zinc-700/40 focus:border-zinc-600 focus:outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="all">All Departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {schoolOptions.map((school) => {
              const isActive = schoolFilter === school.value;
              return (
                <button
                  key={school.value}
                  aria-label={school.label}
                  onClick={() => setSchoolFilter(school.value)}
                  className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{SHORT_LABELS[school.value]}</span>
                  <span className="hidden sm:inline">{school.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {hasActiveFilters && (
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-sm text-zinc-500">
                {filteredFaculty.length} result{filteredFaculty.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {!shouldShowResults ? (
            <div className="rounded-2xl bg-zinc-800 px-5 py-8 sm:p-10 lg:p-12">
              <h2 className="text-[28px] leading-tight sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Faculty Directory
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-500 leading-relaxed max-w-lg">
                Search across all FAST NUCES Islamabad departments. Find office locations, phone extensions, and email addresses.
              </p>

              <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-zinc-700/25 px-3.5 py-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">{totalCount}</p>
                  <p className="text-[11px] sm:text-sm text-zinc-500 mt-1">Faculty</p>
                </div>
                <div className="rounded-xl bg-zinc-700/25 px-3.5 py-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">{deptCount}</p>
                  <p className="text-[11px] sm:text-sm text-zinc-500 mt-1">Departments</p>
                </div>
                <div className="rounded-xl bg-zinc-700/25 px-3.5 py-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">4</p>
                  <p className="text-[11px] sm:text-sm text-zinc-500 mt-1">Schools</p>
                </div>
              </div>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-800 py-16 sm:py-20 px-6 text-center">
              <Search size={24} className="text-zinc-600 mb-4" />
              <h3 className="text-base font-semibold text-white">No results found</h3>
              <p className="mt-1.5 text-sm text-zinc-500 max-w-xs">
                Try a different search term or adjust your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-400 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
