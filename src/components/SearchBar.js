import React, { useState, useRef, useEffect } from 'react';
import { Search, X, BookOpen, User } from 'lucide-react';

const SearchBar = ({ onSearch, suggestions, showSuggestions, onSuggestionClick, onClearSearch, query }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Safety checks
  const safeSuggestions = suggestions || [];
  const safeShowSuggestions = showSuggestions && safeSuggestions.length > 0;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedIndex(-1);
    if (onSearch) onSearch(value);
  };

  const handleKeyDown = (e) => {
    if (!safeShowSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < safeSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && safeSuggestions[selectedIndex]) {
          handleSuggestionClick(safeSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) return;
    
    setSelectedIndex(-1);
    if (onSuggestionClick) onSuggestionClick(suggestion);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSelectedIndex(-1);
    if (onClearSearch) onClearSearch();
    inputRef.current?.focus();
  };

  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold">
            {part}
          </span>
        ) : part
      );
    } catch (error) {
      console.warn('Error highlighting text:', error);
      return text;
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < safeSuggestions.length) {
      const suggestionElement = document.getElementById(`suggestion-${selectedIndex}`);
      suggestionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, safeSuggestions.length]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Search faculty or courses..."
          className="w-full pl-12 pr-12 py-4 text-lg text-gray-900 bg-white border-2 border-gray-300 rounded-2xl focus:border-slate-500 focus:ring-4 focus:ring-slate-200 focus:outline-none placeholder-gray-500"
          style={{ fontSize: '16px' }} // Prevent zoom on iOS
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {safeShowSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {safeSuggestions.map((suggestion, index) => {
              if (!suggestion) return null;
              
              const facultyName = suggestion.name || 'Unknown Faculty';
              const facultyDesignation = suggestion.designation || 'Unknown Position';
              const facultyDepartment = suggestion.department || 'Unknown Department';
              const facultyEmail = suggestion.email || '';
              const facultyCourses = suggestion.courses || [];
              const matchType = suggestion.matchType || 'faculty';
              
              return (
                <div
                  key={`${facultyName}-${facultyDepartment}-${index}`}
                  id={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`p-3 sm:p-4 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    selectedIndex === index 
                      ? 'bg-slate-50 border-l-4 border-l-slate-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {matchType === 'course' ? (
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {highlightMatch(facultyName, query)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">
                        {facultyDesignation}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {facultyDepartment.replace('Faculty Department of ', '')}
                      </div>
                      
                      {/* Show courses if available */}
                      {facultyCourses.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Teaching:</div>
                          <div className="flex flex-wrap gap-1">
                            {facultyCourses.slice(0, 2).map((course, idx) => {
                              if (!course || !course.name) return null;
                              const courseName = course.name.replace(/\s*\([^)]*\)/, '').substring(0, 20);
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 border border-indigo-200"
                                >
                                  {courseName}
                                  {course.name.length > 20 ? '...' : ''}
                                </span>
                              );
                            })}
                            {facultyCourses.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{facultyCourses.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 truncate max-w-[120px] mt-1">
                      {facultyEmail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 