import React, { useState, useMemo, useEffect } from 'react';
import { Search, Moon, Sun, Mail, MapPin, Briefcase } from 'lucide-react';
import { facultyData } from './data/facultyData';
import Footer from './components/Footer';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Improved Levenshtein Distance for accurate typo detection
  const getLevenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1) // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  // Smart Search Logic
  const smartSearch = (text, query) => {
    if (!text || !query) return { matches: false, score: 0 };
    const str = text.toLowerCase();
    const q = query.toLowerCase().trim();
    
    // 1. Exact substring match (Highest priority)
    // This satisfies: "if I'm writing majid only people with names that have majid should come"
    if (str.includes(q)) return { matches: true, score: 100 };
    
    // 2. Intelligent Typo Tolerance
    // Only checks individual words to prevent random long-string partial matches
    const words = str.split(/[ \-\.]+/); // Split by space, hyphen, dot
    const queryWords = q.split(' ');

    for (const qWord of queryWords) {
      if (qWord.length < 3) continue; // Don't fuzzy match very short queries

      for (const word of words) {
        // Optimization: Length diff too big = strictly no match
        if (Math.abs(word.length - qWord.length) > 2) continue; 

        const dist = getLevenshteinDistance(word, qWord);
        
        // Allowed errors based on length:
        // 3-5 chars: 1 error allowed
        // >5 chars: 2 errors allowed
        const allowedErrors = qWord.length > 5 ? 2 : 1;

        if (dist <= allowedErrors) {
          // Score matches: Exact substring > Typo match
          return { matches: true, score: 80 - (dist * 10) };
        }
      }
    }
    
    return { matches: false, score: 0 };
  };

  // Filter and process faculty
  const filteredFaculty = useMemo(() => {
    const allFaculty = facultyData.flatMap(dept => 
      dept.faculty.map(f => ({ ...f, department: dept.department }))
    );

    if (!debouncedQuery) return allFaculty;

    return allFaculty
      .map(f => {
        // Search in Name (Priority)
        const nameMatch = smartSearch(f.name, debouncedQuery);
        
        // Optional: Also search Designation if name doesn't match?
        // User asked "people with names", so we stick primarily to Name.
        // But for usefulness, if someone searches "Professor", we might want that.
        // For now, focusing on the user's specific request about names.
        
        return { ...f, score: nameMatch.score, matches: nameMatch.matches };
      })
      .filter(f => f.matches)
      .sort((a, b) => b.score - a.score);
  }, [debouncedQuery]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* Navbar / Header */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'}`}>
        <h1 className="text-xl font-bold tracking-tighter">Fast Faculty</h1>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-transform hover:scale-110 active:scale-95 ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-900'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 px-4 max-w-4xl mx-auto w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <div className={`text-center w-full transition-all duration-500 ease-in-out ${debouncedQuery ? 'mt-0 mb-8' : 'mt-[15vh] mb-0'}`}>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Faculty</span>
          </h2>
          
          <div className={`transition-all duration-500 ${debouncedQuery ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100 mb-10'}`}>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80 px-4">
              Instantly access faculty office numbers, official emails, and designations.
              <br className="hidden md:block" />
              Simplify your connection with the FAST NUCES faculty.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto group z-10 w-full">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search faculty by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-4 pl-12 pr-4 rounded-2xl text-lg outline-none border-2 transition-all duration-300 shadow-lg ${
                darkMode 
                  ? 'bg-gray-900 border-gray-800 text-white focus:border-blue-500 focus:shadow-blue-500/20' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:shadow-blue-500/10'
              }`}
            />
          </div>

          {/* Feature Badges - Only shown when not searching */}
          <div className={`transition-all duration-500 delay-100 ${debouncedQuery ? 'h-0 opacity-0 overflow-hidden mt-0' : 'h-auto opacity-100 mt-12'}`}>
            <div className="flex flex-wrap justify-center gap-4 opacity-60">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <MapPin size={16} className="text-green-500" />
                <span>Office Locations</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <Mail size={16} className="text-blue-500" />
                <span>Official Emails</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <Briefcase size={16} className="text-purple-500" />
                <span>Designations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid - Only shown when searching */}
        {debouncedQuery && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 animate-in">
            {filteredFaculty.map((faculty, idx) => (
              <div 
                key={idx}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  darkMode 
                    ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900' 
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{faculty.name}</h3>
                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Briefcase size={14} className="mr-1.5" />
                      {faculty.designation}
                    </div>
                  </div>
                  {/* Department Badge REMOVED here as requested */}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm opacity-80">
                    <Mail size={16} className="mr-2 text-blue-500" />
                    <span className="truncate">{faculty.email}</span>
                  </div>
                  <div className="flex items-center text-sm opacity-80">
                    <MapPin size={16} className="mr-2 text-green-500" />
                    <span>{faculty['office#'] === 'N/A' ? 'Office Not Assigned' : faculty['office#']}</span>
                  </div>
                </div>

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${faculty.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-full py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    darkMode 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  <Mail size={18} className="mr-2" />
                  Send Email
                </a>
              </div>
            ))}
            
            {filteredFaculty.length === 0 && (
              <div className="col-span-full text-center py-20 opacity-50">
                <p className="text-xl">No faculty found matches "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;
