import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Users, Grid, List } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FacultyCard from './components/FacultyCard';
import Footer from './components/Footer';
import { facultyData } from './data/facultyData';
import { courseData, courseAliases } from './data/courseData';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search for better performance
  const handleSearchInput = useCallback((query) => {
    setSearchQuery(query);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        setHasSearched(true);
      }
    }, 150); // Reduced debounce time
  }, []);

  // Optimized fuzzy search function
  const fuzzyMatch = useCallback((text, query) => {
    if (!query.trim() || !text) return { matches: false, score: 0 };
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase().trim();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return { matches: true, score: 1000 };
    }
    
    // Simple character matching for performance
    let score = 0;
    let lastIndex = -1;
    
    for (let i = 0; i < queryLower.length; i++) {
      const charIndex = textLower.indexOf(queryLower[i], lastIndex + 1);
      if (charIndex === -1) return { matches: false, score: 0 };
      score += (10 - (charIndex - lastIndex));
      lastIndex = charIndex;
    }
    
    return { matches: true, score };
  }, []);

  // Memoized course info lookup with caching
  const courseCache = useRef(new Map());
  
  const getCourseInfo = useCallback((facultyName) => {
    if (!facultyName || !courseData) return [];
    
    if (courseCache.current.has(facultyName)) {
      return courseCache.current.get(facultyName);
    }
    
    const courses = [];
    
    try {
      // Search theory courses
      if (courseData.theory) {
        for (const course of courseData.theory) {
          if (course.sections) {
            for (const section of course.sections) {
              if (section.teacher_name === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Theory'
                });
              }
            }
          }
        }
      }
      
      // Search lab courses
      if (courseData.lab) {
        for (const course of courseData.lab) {
          if (course.sections) {
            for (const section of course.sections) {
              if (section.lab_course_instructor === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Lab'
                });
              }
            }
          }
        }
      }
      
      // Search EE department courses
      if (courseData.ee_department) {
        for (const course of courseData.ee_department) {
          if (course.sections) {
            for (const section of course.sections) {
              if (section.teacher_name === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Theory'
                });
              }
            }
          }
        }
      }
      
      // Search EE lab courses
      if (courseData.ee_lab) {
        for (const course of courseData.ee_lab) {
          if (course.sections) {
            for (const section of course.sections) {
              if (section.lab_course_instructor === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Lab'
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error getting course info:', error);
    }
    
    courseCache.current.set(facultyName, courses);
    return courses;
  }, []);

  // Optimized faculty data processing
  const allFaculty = useMemo(() => {
    if (!facultyData || !Array.isArray(facultyData)) return [];
    
    const faculty = [];
    for (const dept of facultyData) {
      if (dept.faculty && Array.isArray(dept.faculty)) {
        for (const member of dept.faculty) {
          faculty.push({
            ...member,
            department: dept.department || 'Unknown Department',
            courses: getCourseInfo(member.name)
          });
        }
      }
    }
    return faculty;
  }, [getCourseInfo]);

  // Optimized search with early returns and limits
  const filteredFaculty = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return allFaculty.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    const results = [];
    const queryLower = debouncedQuery.toLowerCase().trim();
    const addedFaculty = new Set();
    const matchedCourse = courseAliases[queryLower];
    
    for (const faculty of allFaculty) {
      let maxScore = 0;
      let hasMatch = false;
      
      // Quick name check first (most common search)
      const nameMatch = fuzzyMatch(faculty.name || '', debouncedQuery);
      if (nameMatch.matches) {
        maxScore = nameMatch.score;
        hasMatch = true;
      }
      
      // Only check other fields if name didn't match
      if (!hasMatch) {
        const designationMatch = fuzzyMatch(faculty.designation || '', debouncedQuery);
        if (designationMatch.matches) {
          maxScore = Math.max(maxScore, designationMatch.score);
          hasMatch = true;
        }
        
        const departmentMatch = fuzzyMatch(faculty.department || '', debouncedQuery);
        if (departmentMatch.matches) {
          maxScore = Math.max(maxScore, departmentMatch.score);
          hasMatch = true;
        }
        
        const emailMatch = fuzzyMatch(faculty.email || '', debouncedQuery);
        if (emailMatch.matches) {
          maxScore = Math.max(maxScore, emailMatch.score);
          hasMatch = true;
        }
      }
      
      // Course search
      if (faculty.courses && faculty.courses.length > 0) {
        for (const course of faculty.courses) {
          const courseMatch = fuzzyMatch(course.name || '', debouncedQuery);
          if (courseMatch.matches) {
            maxScore = Math.max(maxScore, courseMatch.score + 500);
            hasMatch = true;
          }
          
          if (matchedCourse && course.name && course.name.toLowerCase().includes(matchedCourse.toLowerCase())) {
            maxScore = Math.max(maxScore, 1500);
            hasMatch = true;
          }
        }
      }
      
      const facultyKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}`;
      
      if (hasMatch && !addedFaculty.has(facultyKey)) {
        addedFaculty.add(facultyKey);
        results.push({ ...faculty, searchScore: maxScore });
        
        // Limit results for performance
        if (results.length >= 50) break;
      }
    }
    
    return results.sort((a, b) => b.searchScore - a.searchScore);
  }, [allFaculty, debouncedQuery, fuzzyMatch]);

  // Optimized suggestions with limits
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const results = [];
    const queryLower = searchQuery.toLowerCase().trim();
    const addedSuggestions = new Set();
    const matchedCourse = courseAliases[queryLower];
    
          // Course suggestions first - search all course categories
      if (matchedCourse) {
        // Search in existing faculty courses (from theory, lab, ee_department, ee_lab)
        for (const faculty of allFaculty) {
          if (faculty.courses && faculty.courses.length > 0) {
            for (const course of faculty.courses) {
              if (course.name && course.name.toLowerCase().includes(matchedCourse.toLowerCase())) {
                const suggestionKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}`;
                if (!addedSuggestions.has(suggestionKey)) {
                  addedSuggestions.add(suggestionKey);
                  results.push({ ...faculty, searchScore: 1500, matchType: 'course' });
                  if (results.length >= 4) break;
                }
              }
            }
            if (results.length >= 4) break;
          }
        }
      }
    
    // Faculty name suggestions
    if (results.length < 6) {
      for (const faculty of allFaculty) {
        const nameMatch = fuzzyMatch(faculty.name || '', searchQuery);
        if (nameMatch.matches) {
          const suggestionKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}`;
          if (!addedSuggestions.has(suggestionKey)) {
            addedSuggestions.add(suggestionKey);
            results.push({ ...faculty, searchScore: nameMatch.score, matchType: 'faculty' });
            if (results.length >= 6) break;
          }
        }
      }
    }
    
    return results.sort((a, b) => b.searchScore - a.searchScore).slice(0, 6);
  }, [searchQuery, allFaculty, fuzzyMatch]);

  const handleSuggestionClick = useCallback((faculty) => {
    const name = faculty.name || '';
    setSearchQuery(name);
    setDebouncedQuery(name);
    setHasSearched(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setHasSearched(false);
  }, []);

  const shouldShowResults = hasSearched && debouncedQuery.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Faculty Directory
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                FAST NUCES Islamabad Campus - Find faculty contact information instantly
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
              <SearchBar
                onSearch={handleSearchInput}
                suggestions={suggestions}
                showSuggestions={suggestions.length > 0 && searchQuery.trim()}
                onSuggestionClick={handleSuggestionClick}
                onClearSearch={handleClearSearch}
                query={searchQuery}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-blue-400">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Fast Search</h3>
                <p className="text-slate-400 text-sm">
                  Instant results for names and courses
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-green-400">
                  <Grid className="h-8 w-8" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Course Details</h3>
                <p className="text-slate-400 text-sm">
                  View teaching assignments and sections
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 sm:col-span-2 lg:col-span-1">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-orange-400">
                  <List className="h-8 w-8" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Contact Info</h3>
                <p className="text-slate-400 text-sm">
                  Office locations and email addresses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {shouldShowResults && (
        <div>
          {/* Controls */}
          <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-base sm:text-lg font-medium text-gray-900">
                    {filteredFaculty.length} Results
                  </span>
                </div>
                
                {debouncedQuery && (
                  <span className="text-sm text-gray-500">
                    for "{debouncedQuery}"
                  </span>
                )}

                <button
                  onClick={handleClearSearch}
                  className="px-3 py-2 sm:px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm"
                >
                  Clear Search
                </button>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${
                      viewMode === 'grid' ? 'bg-white text-slate-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${
                      viewMode === 'list' ? 'bg-white text-slate-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Grid */}
          <div className="max-w-7xl mx-auto px-4 pb-20">
            {filteredFaculty.length > 0 ? (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredFaculty.map((faculty, index) => (
                  <FacultyCard
                    key={`${faculty.name || 'unknown'}-${faculty.department || 'unknown'}-${index}`}
                    faculty={faculty}
                    department={faculty.department}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No Results Found</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 px-4">
                  No faculty found for "{debouncedQuery}". Try searching for faculty names or course names.
                </p>
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
