import React, { useEffect, useMemo, useState, useDeferredValue, memo, useCallback, useRef } from 'react';
import { Building2, Check, ChevronDown, Copy, Mail, MapPin, Phone, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { facultyDirectory, schoolOptions } from './data/facultyDirectory';
import { searchFaculty } from './utils/search';
import Footer from './components/Footer';

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
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    setDeptDropdownOpen(false);
  }, [schoolFilter]);

  useEffect(() => {
    if (!deptDropdownOpen) return;
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'mousedown' && dropdownRef.current?.contains(e.target)) return;
      if (e.type === 'touchstart' && dropdownRef.current?.contains(e.target)) return;
      setDeptDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', close);
    };
  }, [deptDropdownOpen]);

  const filteredFaculty = useMemo(
    () => searchFaculty(facultyDirectory, deferredSearchQuery, deferredSchoolFilter, deferredDepartmentFilter),
    [deferredSearchQuery, deferredSchoolFilter, deferredDepartmentFilter],
  );

  const totalCount = facultyDirectory.length;

  const hasSearchQuery = Boolean(deferredSearchQuery.trim());
  const hasNonAllFilter = deferredSchoolFilter !== 'all' || deferredDepartmentFilter !== 'all';
  const shouldShowResults = hasSearchQuery;
  const hasFilterWithoutSearch = !hasSearchQuery && hasNonAllFilter;
  const isHomepage = !hasSearchQuery && !hasNonAllFilter;

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
    <div className={`w-full max-w-full overflow-x-hidden bg-zinc-900 text-white flex flex-col font-sans selection:bg-blue-500/20 ${isHomepage ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4 lg:px-8">
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8 min-w-0">

        {/* Top spacer — pushes homepage content to optical center */}
        {isHomepage && <div className="flex-1 min-h-[32px]" />}

        {/* Homepage hero */}
        {isHomepage && (
          <div className="text-center">
            <h2 className="text-[26px] sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Faculty Directory
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Find any faculty member at FAST NUCES Islamabad
            </p>
          </div>
        )}

        {!isHomepage && <div className="pt-4 sm:pt-6" />}

        {/* Search bar */}
        <div className={isHomepage ? 'mt-6 sm:mt-9 max-w-xl w-full mx-auto' : ''}>
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
              <div ref={dropdownRef} className="relative sm:w-56 shrink-0">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={deptDropdownOpen}
                  onClick={() => setDeptDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between rounded-2xl border bg-zinc-800/80 py-3 sm:py-3.5 pl-4 pr-3.5 text-sm font-medium transition-all search-glow ${
                    deptDropdownOpen ? 'border-zinc-600' : 'border-zinc-700/50'
                  }`}
                >
                  <span className={`truncate ${departmentFilter === 'all' ? 'text-zinc-400' : 'text-zinc-200'}`}>
                    {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 ml-2 text-zinc-500 transition-transform duration-150 ${deptDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {deptDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-zinc-800 border border-zinc-700/50 shadow-2xl shadow-black/40 z-50 py-1 max-h-64 overflow-y-auto overscroll-contain"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={departmentFilter === 'all'}
                      onClick={() => { setDepartmentFilter('all'); setDeptDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 sm:py-2.5 text-sm transition-colors ${
                        departmentFilter === 'all'
                          ? 'text-white bg-blue-500/10'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-700/40'
                      }`}
                    >
                      All Departments
                    </button>
                    {departmentOptions.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        role="option"
                        aria-selected={departmentFilter === dept}
                        onClick={() => { setDepartmentFilter(dept); setDeptDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 sm:py-2.5 text-sm transition-colors ${
                          departmentFilter === dept
                            ? 'text-white bg-blue-500/10'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-700/40'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className={`flex flex-wrap gap-2 sm:gap-2.5 ${isHomepage ? 'mt-4 sm:mt-5 justify-center max-w-xl mx-auto' : 'mt-3'}`}>
          {schoolOptions.map((school) => {
            const isActive = schoolFilter === school.value;
            return (
              <button
                key={school.value}
                aria-label={school.label}
                onClick={() => setSchoolFilter(school.value)}
                className={`rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-[15px] font-medium transition-all duration-150 border ${
                  isActive
                    ? 'bg-white text-zinc-900 border-transparent shadow-lg shadow-white/5'
                    : 'bg-zinc-800/70 text-zinc-400 border-zinc-700/40 hover:bg-zinc-700/60 hover:text-zinc-200'
                }`}
              >
                {school.label}
              </button>
            );
          })}
        </div>

        {/* Bottom spacer — larger to push content above center */}
        {isHomepage && <div className="flex-[2]" />}

        {/* Prompt when filter is active but no search query */}
        {hasFilterWithoutSearch && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-28 text-center">
            <Search size={22} className="text-zinc-500 mb-4" />
            <h3 className="text-base font-semibold text-white">Search to see results</h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-xs">
              Type a name, email, or office number to find faculty in this school.
            </p>
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
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
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
