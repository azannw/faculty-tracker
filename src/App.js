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
      className="group flex flex-col rounded-[20px] bg-[#1a1a1a] border border-white/[0.06] p-5 hover:bg-[#1e1e1e] hover:border-white/[0.12] transition-all duration-200 shadow-sm"
    >
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-[16px] font-semibold text-[#f4f4f5] leading-snug" title={facultyMember.name}>
          {facultyMember.name}
        </h3>
        <p className="mt-1 text-[14px] text-[#a1a1aa] line-clamp-1" title={facultyMember.designation}>
          {facultyMember.designation}
        </p>
        <p className="mt-2 text-[12px] text-[#737373] truncate font-medium">
          {facultyMember.department} · {facultyMember.schoolLabel}
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <MapPin size={15} className="text-[#737373] shrink-0" />
          <span className="text-[14px] font-medium text-[#d4d4d8] truncate">{facultyMember.office || '—'}</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <Mail size={15} className="text-[#737373] shrink-0" />
          {facultyMember.email ? (
            <a
              href={`mailto:${facultyMember.email}`}
              className="text-[14px] text-blue-400 truncate hover:text-blue-300 transition-colors"
              title={facultyMember.email}
            >
              {facultyMember.email}
            </a>
          ) : (
            <span className="text-[14px] text-[#52525b]">—</span>
          )}
        </div>
        {facultyMember.extension && (
          <div className="flex items-center gap-3">
            <Phone size={15} className="text-[#737373] shrink-0" />
            <span className="text-[14px] text-[#a1a1aa]">Ext {facultyMember.extension}</span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex gap-2.5">
        <button
          type="button"
          onClick={() => onCopyEmail(facultyMember)}
          disabled={!facultyMember.email}
          className={`flex-1 inline-flex justify-center items-center gap-2 rounded-[12px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
            !facultyMember.email
              ? 'cursor-not-allowed bg-white/[0.02] text-[#52525b]'
              : isCopied
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-white/[0.05] text-[#d4d4d8] hover:bg-white/[0.08] hover:text-white active:scale-[0.98]'
          }`}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
        <a
          href={facultyMember.email ? `mailto:${facultyMember.email}` : undefined}
          className={`flex-1 inline-flex justify-center items-center gap-2 rounded-[12px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
            !facultyMember.email
              ? 'pointer-events-none bg-white/[0.02] text-[#52525b]'
              : 'bg-white text-[#111111] hover:bg-[#e5e5e5] active:scale-[0.98]'
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
    <div className={`relative w-full max-w-[100vw] overflow-x-hidden bg-[#111111] text-white flex flex-col font-sans selection:bg-white/20 ${isHomepage ? 'h-[100dvh] overflow-y-hidden' : 'min-h-screen'}`}>
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '180px 180px' }} />
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#111111]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#111111]/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-white" />
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-none">
              FAST Faculty
            </h1>
          </div>
          <span className="text-sm text-[#737373] tabular-nums">
            {totalCount} faculty
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8 min-w-0">
        {/* Top spacer */}
        {isHomepage && <div className="flex-1 min-h-[32px]" />}

        {/* Homepage hero */}
        {isHomepage && (
          <div className="text-center mt-4 sm:mt-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Faculty Directory
            </h2>
            <p className="mt-3 sm:mt-4 text-[15px] sm:text-base text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
              Find any faculty member at FAST NUCES Islamabad
            </p>
          </div>
        )}

        {!isHomepage && <div className="pt-4 sm:pt-6" />}

        {/* Search bar */}
        <div className={isHomepage ? 'mt-8 sm:mt-10 max-w-2xl w-full mx-auto' : ''}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-0 rounded-[18px] border border-white/[0.08] bg-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors focus-within:!bg-[#1a1a1a] focus-within:border-white/[0.15] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]">
              <Search size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
              <input
                type="text"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full min-w-0 rounded-[18px] bg-transparent py-3.5 sm:py-4 pl-[44px] sm:pl-[46px] pr-12 text-[15px] sm:text-[16px] text-white placeholder:text-[#737373] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#737373] hover:text-[#e5e5e5] hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {schoolFilter !== 'all' && (
              <div ref={dropdownRef} className="relative sm:w-60 shrink-0">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={deptDropdownOpen}
                  onClick={() => setDeptDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between rounded-[18px] border bg-[#1a1a1a] hover:bg-[#1a1a1a] py-3.5 sm:py-4 pl-5 pr-4 text-[15px] font-medium transition-colors ${
                    deptDropdownOpen ? 'border-white/[0.15] bg-[#1a1a1a]' : 'border-white/[0.08]'
                  }`}
                >
                  <span className={`truncate ${departmentFilter === 'all' ? 'text-[#737373]' : 'text-[#e5e5e5]'}`}>
                    {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 ml-2 text-[#737373] transition-transform duration-200 ${deptDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {deptDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-[16px] bg-[#1a1a1a] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 py-1.5 max-h-64 overflow-y-auto overscroll-contain"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={departmentFilter === 'all'}
                      onClick={() => { setDepartmentFilter('all'); setDeptDropdownOpen(false); }}
                      className={`w-full text-left px-5 py-2.5 text-[14px] transition-colors flex items-center ${
                        departmentFilter === 'all'
                          ? 'text-white bg-white/[0.06]'
                          : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
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
                        className={`w-full text-left px-5 py-2.5 text-[14px] transition-colors flex items-center ${
                          departmentFilter === dept
                            ? 'text-white bg-white/[0.06]'
                            : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
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
        <div className={`flex flex-wrap gap-2 sm:gap-2.5 ${isHomepage ? 'mt-6 sm:mt-8 justify-center max-w-2xl mx-auto' : 'mt-4'}`}>
          {schoolOptions.map((school) => {
            const isActive = schoolFilter === school.value;
            return (
              <button
                key={school.value}
                aria-label={school.label}
                onClick={() => setSchoolFilter(school.value)}
                className={`rounded-[14px] px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] sm:text-[14px] font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-white text-[#111111] border-transparent shadow-[0_1px_8px_rgba(255,255,255,0.1)]'
                    : 'bg-[#1a1a1a] text-[#a1a1aa] border-white/[0.06] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] hover:border-white/[0.1]'
                }`}
              >
                {school.label}
              </button>
            );
          })}
        </div>

        {/* Bottom spacer */}
        {isHomepage && <div className="flex-[2]" />}

        {/* Prompt when filter is active but no search query */}
        {hasFilterWithoutSearch && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-28 text-center">
            <Search size={24} className="text-[#737373] mb-4" />
            <h3 className="text-[16px] font-semibold text-white">Search to see results</h3>
            <p className="mt-2 text-[15px] text-[#a1a1aa] max-w-xs">
              Type a name, email, or office number to find faculty in this school.
            </p>
          </div>
        )}

        {/* Results */}
        {shouldShowResults && (
          <div className="mt-4 sm:mt-6 flex-1">
            {hasActiveFilters && (
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <p className="text-sm text-[#737373]">
                  {filteredFaculty.length} result{filteredFaculty.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-white hover:text-[#e5e5e5] transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {filteredFaculty.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-28 text-center">
                <div className="rounded-[20px] bg-[#1a1a1a] border border-white/[0.05] p-5 mb-5">
                  <Search size={24} className="text-[#737373]" />
                </div>
                <h3 className="text-[16px] font-semibold text-white">No results found</h3>
                <p className="mt-2 text-[15px] text-[#a1a1aa] max-w-xs">
                  Try a different search term or adjust your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#111111] hover:bg-[#e5e5e5] transition-colors active:scale-[0.98]"
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
