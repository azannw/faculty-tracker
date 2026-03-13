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
      className="group flex flex-col rounded-2xl bg-zinc-800/50 border border-zinc-700/40 p-4 sm:p-5 hover:bg-zinc-800/80 hover:border-zinc-600/60 transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-white leading-snug" title={facultyMember.name}>
          {facultyMember.name}
        </h3>
        <p className="mt-0.5 text-sm text-zinc-400 line-clamp-1" title={facultyMember.designation}>
          {facultyMember.designation}
        </p>
        <p className="mt-1.5 text-xs text-zinc-500 truncate">
          {facultyMember.department} · {facultyMember.schoolLabel}
        </p>
      </div>

      <div className="mt-3.5 space-y-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin size={14} className="text-zinc-500 shrink-0" />
          <span className="text-sm font-medium text-zinc-300 truncate">{facultyMember.office || '—'}</span>
        </div>
        <div className="flex items-center gap-2.5 min-w-0">
          <Mail size={14} className="text-zinc-500 shrink-0" />
          {facultyMember.email ? (
            <a
              href={`mailto:${facultyMember.email}`}
              className="text-sm text-blue-400 truncate hover:text-blue-300 transition-colors"
              title={facultyMember.email}
            >
              {facultyMember.email}
            </a>
          ) : (
            <span className="text-sm text-zinc-600">—</span>
          )}
        </div>
        {facultyMember.extension && (
          <div className="flex items-center gap-2.5">
            <Phone size={14} className="text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-400">Ext {facultyMember.extension}</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3.5 border-t border-zinc-700/30 flex gap-2">
        <button
          type="button"
          onClick={() => onCopyEmail(facultyMember)}
          disabled={!facultyMember.email}
          className={`flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
            !facultyMember.email
              ? 'cursor-not-allowed bg-zinc-700/20 text-zinc-600'
              : isCopied
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-zinc-700/40 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-[0.98]'
          }`}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? 'Copied' : 'Copy Email'}
        </button>
        <a
          href={facultyMember.email ? `mailto:${facultyMember.email}` : undefined}
          className={`flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
            !facultyMember.email
              ? 'pointer-events-none bg-zinc-700/20 text-zinc-600'
              : 'bg-blue-500 text-white hover:bg-blue-400 active:scale-[0.98]'
          }`}
        >
          <Mail size={14} />
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
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-blue-500" />
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-none">
              FAST Faculty
            </h1>
          </div>
          <span className="text-sm text-zinc-500 tabular-nums">
            {totalCount} faculty
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">

        {/* Homepage hero */}
        {!shouldShowResults && (
          <div className="text-center pt-8 sm:pt-[13vh]">
            <h2 className="text-[26px] sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Faculty Directory
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Find any faculty member at FAST NUCES Islamabad
            </p>
          </div>
        )}

        {shouldShowResults && <div className="pt-4 sm:pt-6" />}

        {/* Search bar */}
        <div className={!shouldShowResults ? 'mt-5 sm:mt-9' : ''}>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 search-glow">
              <Search size={18} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or office..."
                className="w-full rounded-2xl bg-transparent py-3 sm:py-3.5 pl-11 sm:pl-12 pr-11 sm:pr-12 text-sm sm:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {schoolFilter !== 'all' && (
              <div className="relative sm:w-56 shrink-0 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 search-glow">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={`w-full rounded-2xl bg-transparent py-3 sm:py-3.5 pl-4 pr-10 text-sm font-medium focus:outline-none appearance-none cursor-pointer transition-colors ${
                    departmentFilter === 'all' ? 'text-zinc-400' : 'text-zinc-200'
                  }`}
                >
                  <option value="all">All Departments</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className={`mt-3 flex gap-1.5 overflow-x-auto no-scrollbar sm:gap-2 sm:overflow-visible sm:flex-wrap ${!shouldShowResults ? 'sm:justify-center' : ''}`}>
          {schoolOptions.map((school) => {
            const isActive = schoolFilter === school.value;
            return (
              <button
                key={school.value}
                aria-label={school.label}
                onClick={() => setSchoolFilter(school.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? 'bg-white text-zinc-900 border-transparent'
                    : 'bg-zinc-800/70 text-zinc-400 border-zinc-700/40 hover:bg-zinc-700/60 hover:text-zinc-200'
                }`}
              >
                <span className="sm:hidden">{SHORT_LABELS[school.value]}</span>
                <span className="hidden sm:inline">{school.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats — homepage only */}
        {!shouldShowResults && (
          <div className="mt-8 sm:mt-16 flex items-center justify-center">
            <div className="flex items-center gap-5 sm:gap-12">
              <div className="text-center">
                <p className="text-xl sm:text-3xl font-bold text-white tabular-nums">{totalCount}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 uppercase tracking-widest">Faculty</p>
              </div>
              <div className="h-7 sm:h-8 w-px bg-zinc-700/50" />
              <div className="text-center">
                <p className="text-xl sm:text-3xl font-bold text-white tabular-nums">{deptCount}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 uppercase tracking-widest">Depts</p>
              </div>
              <div className="h-7 sm:h-8 w-px bg-zinc-700/50" />
              <div className="text-center">
                <p className="text-xl sm:text-3xl font-bold text-white tabular-nums">4</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 uppercase tracking-widest">Schools</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {shouldShowResults && (
          <div className="mt-4 sm:mt-6 flex-1">
            {hasActiveFilters && (
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  {filteredFaculty.length} result{filteredFaculty.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {filteredFaculty.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-28 text-center">
                <div className="rounded-2xl bg-zinc-800/60 p-4 mb-5">
                  <Search size={22} className="text-zinc-500" />
                </div>
                <h3 className="text-base font-semibold text-white">No results found</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-xs">
                  Try a different search term or adjust your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-400 transition-colors active:scale-[0.98]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
