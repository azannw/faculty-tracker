import React from 'react';
import { Mail, MapPin, Briefcase, Building, Copy, BookOpen } from 'lucide-react';

const FacultyCard = ({ faculty, department, index }) => {
  // Safety checks
  if (!faculty) return null;
  
  const facultyName = faculty.name || 'Unknown Faculty';
  const facultyDesignation = faculty.designation || 'Unknown Designation';
  const facultyEmail = faculty.email || 'No email provided';
  const facultyOffice = faculty['office#'] || 'N/A';
  const facultyDepartment = department || 'Unknown Department';
  const facultyCourses = faculty.courses || [];

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${type} copied to clipboard: ${text}`);
    }).catch(err => {
      console.warn('Failed to copy to clipboard:', err);
    });
  };

  const getDepartmentColor = (dept) => {
    if (!dept) return 'bg-slate-50 text-slate-800 border-slate-200';
    
    const colors = {
      'Computer Science': 'bg-blue-50 text-blue-800 border-blue-200',
      'Cyber Security': 'bg-red-50 text-red-800 border-red-200',
      'Software Engineering': 'bg-green-50 text-green-800 border-green-200',
      'Artificial Intelligence': 'bg-purple-50 text-purple-800 border-purple-200',
      'Science And Humanities': 'bg-orange-50 text-orange-800 border-orange-200',
      'Expected to Join': 'bg-gray-50 text-gray-800 border-gray-200'
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (dept.includes(key)) return value;
    }
    return 'bg-slate-50 text-slate-800 border-slate-200';
  };

  const openGmail = () => {
    if (!facultyEmail || facultyEmail === 'No email provided') {
      alert('No email address available for this faculty member.');
      return;
    }
    
    try {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(facultyEmail)}&su=${encodeURIComponent(`Contact from Faculty Directory`)}&body=${encodeURIComponent(`Dear ${facultyName},\n\nI hope this email finds you well.\n\nBest regards`)}`;
      window.open(gmailUrl, '_blank');
    } catch (error) {
      console.error('Error opening Gmail:', error);
      // Fallback to mailto
      window.location.href = `mailto:${facultyEmail}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden">
      {/* Department Badge */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6">
        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getDepartmentColor(facultyDepartment)}`}>
          <Building className="h-3 w-3 mr-1 sm:mr-1.5" />
          <span className="hidden sm:inline">{facultyDepartment.replace('Faculty Department of ', '')}</span>
          <span className="sm:hidden">{facultyDepartment.replace('Faculty Department of ', '').split(' ')[0]}</span>
        </span>
      </div>

      <div className="p-4 sm:p-6 pt-3 sm:pt-4">
        {/* Faculty Name and Designation */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">
            {facultyName}
          </h3>
          <div className="flex items-center text-slate-600">
            <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{facultyDesignation}</span>
          </div>
        </div>

        {/* Course Information */}
        {facultyCourses.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-3">
              <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Teaching</span>
            </div>
            <div className="space-y-2">
              {facultyCourses.slice(0, 3).map((course, idx) => {
                if (!course || !course.name) return null;
                return (
                  <div key={idx} className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                    <div className="text-sm font-medium text-indigo-900">
                      {course.name.replace(/\s*\([^)]*\)/, '')}
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">
                      {course.section || 'Unknown Section'} • {course.type || 'Unknown Type'}
                    </div>
                  </div>
                );
              })}
              {facultyCourses.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  +{facultyCourses.length - 3} more courses
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {/* Email */}
          <div 
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer active:bg-gray-200 min-h-[60px] sm:min-h-[auto]"
            onClick={() => copyToClipboard(facultyEmail, 'email')}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{facultyEmail}</p>
              </div>
            </div>
            <Copy className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 flex-shrink-0" />
          </div>

          {/* Office */}
          <div 
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer active:bg-gray-200 min-h-[60px] sm:min-h-[auto]"
            onClick={() => copyToClipboard(facultyOffice, 'office')}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <MapPin className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Office</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {facultyOffice === 'N/A' ? 'Not Assigned' : facultyOffice}
                </p>
              </div>
            </div>
            <Copy className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 flex-shrink-0" />
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-2">
          <button
            onClick={openGmail}
            disabled={!facultyEmail || facultyEmail === 'No email provided'}
            className={`flex-1 inline-flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg text-sm font-medium min-h-[48px] sm:min-h-[auto] ${
              facultyEmail && facultyEmail !== 'No email provided'
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </button>
          
          {/* Quick Copy Button for Mobile */}
          <button
            onClick={() => {
              const courseList = facultyCourses.length > 0 
                ? `\nCourses:\n${facultyCourses.map(c => `- ${c.name || 'Unknown Course'} (${c.section || 'Unknown Section'})`).join('\n')}`
                : '';
              const contactInfo = `${facultyName}\nEmail: ${facultyEmail}\nOffice: ${facultyOffice === 'N/A' ? 'Not Assigned' : facultyOffice}\nDepartment: ${facultyDepartment.replace('Faculty Department of ', '')}${courseList}`;
              copyToClipboard(contactInfo, 'contact info');
            }}
            className="sm:hidden flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium min-h-[48px]"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyCard; 