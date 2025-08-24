import React, { useState, useMemo, useCallback } from 'react';
import { Users, Grid, List } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FacultyCard from './components/FacultyCard';
import Footer from './components/Footer';
import { facultyData } from './data/facultyData';
import { courseData, courseAliases } from './data/courseData';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [hasSearched, setHasSearched] = useState(false);

  // Enhanced fuzzy search function
  const fuzzyMatch = useCallback((text, query) => {
    if (!query.trim() || !text) return { matches: false, score: 0 };
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase().trim();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return { matches: true, score: 1000 };
    }
    
    // Check if all characters in query exist in text (in order)
    let textIndex = 0;
    let queryIndex = 0;
    let score = 0;
    let consecutiveMatches = 0;
    
    while (textIndex < textLower.length && queryIndex < queryLower.length) {
      if (textLower[textIndex] === queryLower[queryIndex]) {
        queryIndex++;
        consecutiveMatches++;
        score += consecutiveMatches * 10;
      } else {
        consecutiveMatches = 0;
      }
      textIndex++;
    }
    
    if (queryIndex === queryLower.length) {
      score += Math.max(0, 100 - textLower.length);
      return { matches: true, score };
    }
    
    return { matches: false, score: 0 };
  }, []);

  // Get course information for faculty
  const getCourseInfo = useCallback((facultyName) => {
    if (!facultyName || !courseData) return [];
    
    const courses = [];
    
    try {
      // Search in theory courses
      if (courseData.theory && Array.isArray(courseData.theory)) {
        courseData.theory.forEach(course => {
          if (course.sections && Array.isArray(course.sections)) {
            course.sections.forEach(section => {
              if (section.teacher_name === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Theory'
                });
              }
            });
          }
        });
      }
      
      // Search in lab courses
      if (courseData.lab && Array.isArray(courseData.lab)) {
        courseData.lab.forEach(course => {
          if (course.sections && Array.isArray(course.sections)) {
            course.sections.forEach(section => {
              if (section.lab_course_instructor === facultyName) {
                courses.push({
                  name: course.course_name || 'Unknown Course',
                  section: section.section || 'Unknown Section',
                  type: 'Lab'
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.warn('Error getting course info for', facultyName, error);
    }
    
    return courses;
  }, []);

  const allFaculty = useMemo(() => {
    if (!facultyData || !Array.isArray(facultyData)) return [];
    
    try {
      return facultyData.flatMap(dept => 
        (dept.faculty && Array.isArray(dept.faculty)) ? dept.faculty.map(faculty => ({
          ...faculty,
          department: dept.department || 'Unknown Department',
          courses: getCourseInfo(faculty.name)
        })) : []
      );
    } catch (error) {
      console.error('Error processing faculty data:', error);
      return [];
    }
  }, [getCourseInfo]);

  // Enhanced search with course support
  const filteredFaculty = useMemo(() => {
    let filtered = allFaculty;

    if (searchQuery.trim()) {
      const results = [];
      const queryLower = searchQuery.toLowerCase().trim();
      const addedFaculty = new Set(); // Track added faculty to prevent duplicates
      
      // Check if query matches course aliases
      const matchedCourse = courseAliases ? courseAliases[queryLower] : null;
      
      filtered.forEach(faculty => {
        let maxScore = 0;
        let hasMatch = false;
        
        try {
          // Search in faculty name
          const nameMatch = fuzzyMatch(faculty.name || '', searchQuery);
          if (nameMatch.matches) {
            maxScore = Math.max(maxScore, nameMatch.score);
            hasMatch = true;
          }
          
          // Search in designation
          const designationMatch = fuzzyMatch(faculty.designation || '', searchQuery);
          if (designationMatch.matches) {
            maxScore = Math.max(maxScore, designationMatch.score);
            hasMatch = true;
          }
          
          // Search in department
          const departmentMatch = fuzzyMatch(faculty.department || '', searchQuery);
          if (departmentMatch.matches) {
            maxScore = Math.max(maxScore, departmentMatch.score);
            hasMatch = true;
          }
          
          // Search in email
          const emailMatch = fuzzyMatch(faculty.email || '', searchQuery);
          if (emailMatch.matches) {
            maxScore = Math.max(maxScore, emailMatch.score);
            hasMatch = true;
          }
          
          // Search in courses taught by faculty
          if (faculty.courses && Array.isArray(faculty.courses)) {
            faculty.courses.forEach(course => {
              const courseMatch = fuzzyMatch(course.name || '', searchQuery);
              if (courseMatch.matches) {
                maxScore = Math.max(maxScore, courseMatch.score + 500); // Boost course matches
                hasMatch = true;
              }
              
              // Check against course aliases
              if (matchedCourse && course.name && course.name.toLowerCase().includes(matchedCourse.toLowerCase())) {
                maxScore = Math.max(maxScore, 1500); // Highest priority for alias matches
                hasMatch = true;
              }
            });
          }
          
          // Create unique key for faculty to prevent duplicates
          const facultyKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}-${faculty.department || 'unknown'}`;
          
          if (hasMatch && !addedFaculty.has(facultyKey)) {
            addedFaculty.add(facultyKey);
            results.push({ ...faculty, searchScore: maxScore });
          }
        } catch (error) {
          console.warn('Error processing faculty in search:', faculty.name, error);
        }
      });
      
      filtered = results.sort((a, b) => b.searchScore - a.searchScore);
    } else {
      filtered.sort((a, b) => {
        try {
          switch (sortBy) {
            case 'name':
              return (a.name || '').localeCompare(b.name || '');
            case 'department':
              return (a.department || '').localeCompare(b.department || '');
            case 'designation':
              return (a.designation || '').localeCompare(b.designation || '');
            default:
              return 0;
          }
        } catch (error) {
          console.warn('Error sorting faculty:', error);
          return 0;
        }
      });
    }

    return filtered;
  }, [allFaculty, searchQuery, sortBy, fuzzyMatch, courseAliases]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    const queryLower = searchQuery.toLowerCase().trim();
    const addedSuggestions = new Set(); // Track added suggestions to prevent duplicates
    
    try {
      // Add course suggestions
      const matchedCourse = courseAliases ? courseAliases[queryLower] : null;
      if (matchedCourse) {
        allFaculty.forEach(faculty => {
          if (faculty.courses && Array.isArray(faculty.courses)) {
            faculty.courses.forEach(course => {
              if (course.name && course.name.toLowerCase().includes(matchedCourse.toLowerCase())) {
                const suggestionKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}`;
                if (!addedSuggestions.has(suggestionKey)) {
                  addedSuggestions.add(suggestionKey);
                  results.push({ ...faculty, searchScore: 1500, matchType: 'course' });
                }
              }
            });
          }
        });
      }
      
      // Add faculty name suggestions
      allFaculty.forEach(faculty => {
        const nameMatch = fuzzyMatch(faculty.name || '', searchQuery);
        if (nameMatch.matches) {
          const suggestionKey = `${faculty.name || 'unknown'}-${faculty.email || 'unknown'}`;
          if (!addedSuggestions.has(suggestionKey)) {
            addedSuggestions.add(suggestionKey);
            results.push({ ...faculty, searchScore: nameMatch.score, matchType: 'faculty' });
          }
        }
      });
    } catch (error) {
      console.warn('Error generating suggestions:', error);
    }
    
    return results
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 8);
  }, [searchQuery, allFaculty, fuzzyMatch, courseAliases]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setHasSearched(true);
    }
  }, []);

  const handleSuggestionClick = useCallback((faculty) => {
    setSearchQuery(faculty.name || '');
    setHasSearched(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setHasSearched(false);
  }, []);

  const shouldShowResults = hasSearched && searchQuery.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Fast Faculty Directory
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                Islamabad Campus • Find faculty members and course information instantly
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
              <SearchBar
                onSearch={handleSearch}
                suggestions={suggestions}
                showSuggestions={suggestions.length > 0 && searchQuery.trim()}
                onSuggestionClick={handleSuggestionClick}
                onClearSearch={handleClearSearch}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-blue-400">⚡</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-slate-400 text-sm">
                  Zero delay search with instant results
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-green-400">📚</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Course Info</h3>
                <p className="text-slate-400 text-sm">
                  Search by course name or find teaching assignments
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700 sm:col-span-2 lg:col-span-1">
                <div className="h-8 w-8 mx-auto mb-3 sm:mb-4 text-orange-400">📍</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Contact Details</h3>
                <p className="text-slate-400 text-sm">
                  Get office numbers and email addresses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Results */}
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
                
                {searchQuery && (
                  <span className="text-sm text-gray-500">
                    for "{searchQuery}"
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 sm:px-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="designation">Sort by Designation</option>
                </select>

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

          {/* Results */}
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
                  No faculty members found for "{searchQuery}". Try searching for course names like "PF", "Data Structures", or faculty names.
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
