import { facultyData as legacyFacultyData } from './facultyData';

const SCHOOL_LABELS = {
  computing: 'School of Computing',
  engineering: 'School of Engineering',
  business: 'Business School',
  humanities: 'Sciences & Humanities',
};

const toKey = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const normalizeEmail = (value = '') => value.trim().toLowerCase();
const normalizeOffice = (value = '') => (value && value !== 'N/A' ? value : '');

const NAME_ALIASES = {
  [toKey('Dr. Faisal Cheema')]: toKey('Dr. Muhammad Faisal Cheema'),
  [toKey('Mr. Fahad Shafique')]: toKey('Mr. Fahad Shafique Mirza'),
  [toKey('Mr. Muhammad Owais Idrees')]: toKey('Mr. Owais Idrees'),
  [toKey('Mr. M. Aadil Ur Rehman')]: toKey('Mr. Muhammad Aadi Ur Rehman'),
  [toKey('Mr. Syed Muhammad Saad Salman')]: toKey('Mr. Syed M.Saad Salman'),
  [toKey('Dr. Mateen Yaqoob')]: toKey('Dr. Muhammad Mateen Yaqoob'),
  [toKey('Dr. Muhammad Ishtiaq')]: toKey('Dr. M. Ishtiaq'),
  [toKey('Mr. Adil Majeed')]: toKey('Dr. Adil Majeed'),
  [toKey('Dr. Zafar Iqbal')]: toKey('Dr. Zafar Iqbal Abbasi'),
  [toKey('Dr Qurat Ul Ain')]: toKey('Dr. Qurrat ul ain'),
  [toKey('Dr Muhammad Abbas')]: toKey('Dr. Muhammad Abbas'),
  [toKey('Dr Rehan Aftab')]: toKey('Dr. Rehan Aftab'),
  [toKey('Dr Sadia Nadeem')]: toKey('Dr. Sadia Nadeem'),
  [toKey('Mr Adil Amin Kazi')]: toKey('Mr. Adil Amin Kazi'),
  [toKey('Mr Syed Kashif Raza')]: toKey('Mr. Syed Muhammad Kashif Raza'),
  [toKey('Mr Arfeen Gohar')]: toKey('Mr. Muhammad Arfeen Gohar'),
  [toKey('Mr Usman Chaudhry')]: toKey('Mr. Usman Zafar Chaudhry'),
  [toKey('Ms Amna Farooqui')]: toKey('Ms. Amna Farooqui Arsalan'),
  [toKey('Dr Nadeem Sarwer')]: toKey('Dr. Muhammad Nadeem Sarwar'),
  [toKey('Dr Danial Hassan')]: toKey('Dr. Danial Hasan'),
  [toKey('Mr Qaiser Shafi')]: toKey('Mr. Muhammad Qaiser Shafi'),
};

const resolveLookupKey = (value = '') => NAME_ALIASES[toKey(value)] || toKey(value);

const pushLookupValue = (lookup, name, value) => {
  if (!value) {
    return;
  }

  const key = resolveLookupKey(name);
  lookup[key] = lookup[key] || [];
  lookup[key].push(value);
};

const buildOfficeLookup = (entries) =>
  entries.reduce((lookup, [name, offices]) => {
    const officeList = Array.isArray(offices) ? offices : [offices];
    officeList.forEach((office) => pushLookupValue(lookup, name, office));
    return lookup;
  }, {});

const applyPairwiseOfficeAssignments = (lookup, entries) => {
  entries.forEach(([names, offices]) => {
    const nameParts = names.split(/\s*\/\s*/);
    const officeParts = offices.split(/\s*\/\s*/);

    if (nameParts.length === officeParts.length) {
      nameParts.forEach((namePart, index) => {
        pushLookupValue(lookup, namePart, officeParts[index]);
      });
      return;
    }

    nameParts.forEach((namePart) => {
      officeParts.forEach((officePart) => pushLookupValue(lookup, namePart, officePart));
    });
  });
};

const getOffice = (lookup, name) => {
  const offices = lookup[resolveLookupKey(name)] || [];
  const uniqueOffices = [...new Set(offices.filter(Boolean))];
  return uniqueOffices.join(' / ');
};

const buildExtensionLookup = (entries) =>
  entries.reduce((lookup, [name, extension]) => {
    if (extension) {
      lookup[resolveLookupKey(name)] = extension;
    }
    return lookup;
  }, {});

const getExtension = (lookup, name) => lookup[resolveLookupKey(name)] || '';

const createRecord = ({
  name,
  designation,
  email = '',
  office = '',
  extension = '',
  school,
  department,
}) => ({
  id: `${school}-${toKey(department)}-${toKey(name)}`,
  name,
  designation,
  email: normalizeEmail(email),
  office: normalizeOffice(office),
  extension: extension.trim(),
  school,
  schoolLabel: SCHOOL_LABELS[school],
  department,
});

const engineeringOfficeLookup = buildOfficeLookup([
  ['Dr. Muhammad Tariq', 'B-01'],
  ['Mr. Shehzad Ahmad', 'B-105'],
  ['Dr. Shahid Qureshi', 'B-113'],
  ['Dr. M. Ibrar Khan', 'B-103'],
  ['Ms. Sana Saleh', 'B-05'],
  ['Ms. Maryam Zafar', 'B-108'],
  ['Mr. Fasih Ahmad Janjua', 'B-126'],
  ['Ms. Tooba', 'B-109'],
  ['Dr. Niaz Ahmed', 'B-12'],
  ['Dr. Mukhtar Ullah', 'B-102'],
  ['Dr. Rashad Ramzan', 'D-10'],
  ['Dr. Hassan Saif', 'D-11'],
  ['Dr. Shahzad Saleem', 'B-112'],
  ['Dr. Aamer Hafeez', 'B-08'],
  ['Dr. Muhammad Saeed', 'B-104'],
  ['Dr. Irum Saba', 'B-04'],
  ['Dr. Farhan Khalid', 'B-101'],
  ['Mr. Aamer Munir', 'B-07'],
  ['Mr. Fakhar Abbas', 'B-126'],
  ['Ms. Maria Nasir', 'B-06'],
  ['Ms. Nimra Fatima', 'B-05'],
  ['Dr. Muhammad Awais', 'B-106'],
  ['Mr. Hazrat Ali', 'B-126'],
  ['Mr. Abu Bakar', 'B-22A'],
  ['Mr. Muhammad Abd Ur Rehman', 'B-22A'],
  ['Mr. Burhan Naeem', 'B-22A'],
  ['Ms. Deema Zargoon Talib', 'B-108'],
]);

const businessOfficeLookup = buildOfficeLookup([
  ['Dr. Sadia Nadeem', ['A-09', '114-A']],
  ['Dr. Aneka Fahima Sufi', '105-C'],
  ['Dr. Muhammad Abbas', '114-D'],
  ['Dr. Haider Ali', '111-F'],
  ['Mr. Muhammad Adeel Anwer', '216-A'],
  ['Dr. Abdul Wahab', '216-D'],
  ['Dr. Qurrat ul ain', '215-F'],
  ['Dr. Danial Hasan', '209-C'],
  ['Dr. Muhammad Nadeem Sarwar', '209-B'],
  ['Dr. Sarah Khan', '114-F'],
  ['Dr. Sajjad Hussain', '111-G'],
  ['Dr. Hamnah Rahat', '216-B'],
  ['Mr. Usman Zafar Chaudhry', '114-C'],
  ['Mr. Aftab Bhatti', '111-D'],
  ['Mr. Hammad Majeed', '114-E'],
  ['Ms. Ayesha Yaqoob', '111-B'],
  ['Mr. Muhammad Qaiser Shafi', '216-F'],
  ['Ms. Sidra Abbas', '114-G'],
  ['Mr. Mansoor Mushtaq', '215-D'],
  ['Mr. Abdul Wahab Tahir', '209-F'],
  ['Mr. Syed Muhammad Kashif Raza', '114-B'],
  ['Ms. Asma Masood Malik', '215-A'],
  ['Mr. Mehmood Ur Rehman', '111-C'],
  ['Mr. Adnan Feroz Rana', '304-F'],
  ['Mr. Abdul Mannan', '304-G'],
  ['Mr. Ali Hassan', '304-F'],
  ['Mr. Hafiz Muhammad Awais Riaz', '304-A'],
  ['Mr. Mueed Ahmad', '304-A'],
  ['Mr. Muhammad Arfeen Gohar', '209-F'],
  ['Mr. Imad Ahmad', '304-E'],
  ['Ms. Samiya Hameed', '209-G'],
  ['Ms. Areeba Adnan', '304-B'],
  ['Dr. Muhammad Hanif Akhtar', '215-E'],
  ['Dr. Muhammad Akhtar', ['111-A', '115-A']],
  ['Dr. Usama Arshad', '215-B'],
  ['Dr. Rameeza Andleeb', '215-G'],
  ['Dr. Rehan Aftab', '209-E'],
  ['Dr. Muhammad Bilal Saeed', '215-C'],
  ['Ms. Amna Farooqui Arsalan', '209-D'],
  ['Mr. Sajjad Hanif', '111-C'],
  ['Ms. Syeda Hoor ul ain Ali', '304-H'],
  ['Ms. Aleena Nadeem', '209-G'],
]);

applyPairwiseOfficeAssignments(businessOfficeLookup, [
  ['Dr Muhammad Abbas / Dr Rehan Aftab', '114-D / 209-E'],
  ['Dr Sadia Nadeem / Mr Adil Amin Kazi', 'A-09 / 216-C'],
  ['Mr Syed Jawad Ali Kazmi / Mr Syed Kashif Raza', '114-B / 114-B'],
]);

const computingExtensionLookup = {
  'Computer Science': buildExtensionLookup([
    ['Dr. Muhammad Arshad Islam', '3200'],
    ['Dr. Hammad Majeed', '672'],
    ['Dr. Ahmad Raza Shahid', '634'],
    ['Dr. Labiba Fahad', '637'],
    ['Dr. Akhtar Jamil', '3218'],
    ['Dr. Ejaz Ahmed', '647'],
    ['Ms. Noor Ul Ain', '656'],
    ['Dr. Basharat Hussain', '6823'],
    ['Dr. Ali Zeeshan Ijaz', '505'],
    ['Dr. Muhammad Faisal Cheema', '515'],
    ['Ms. Amna Irum', '632'],
    ['Dr. Hina Ayaz', '642'],
    ['Dr. Muhammad Rizwan', '3253'],
    ['Mr. Shams Farooq', '653'],
    ['Mr. Muhammad Farrukh Bashir', '338'],
    ['Ms. Hira Mastoor', '603'],
    ['Mr. Muhammad Aamir Gulzar', '341'],
    ['Mr. Majid Hussain', '3229'],
    ['Ms. Nirmal Tariq', '526'],
    ['Mr. Owais Idrees', '3228'],
    ['Mr. Muhammad Almas Khan', '3230'],
    ['Ms. Saba Kanwal', '347'],
    ['Ms. Marium Hida', '3225'],
    ['Mr. Shehreyar Rashid', '655'],
    ['Mr. Syed M.Saad Salman', '516'],
    ['Mr. Muhammad Aadi Ur Rehman', '3235'],
    ['Ms. Maryam Shahbaz', '3233'],
    ['Ms. Hajira Uzair', '657'],
    ['Mr. Usama Bin Imran', '307'],
    ['Ms. Zill-E-Huma', '666'],
    ['Ms. Syeda Mahnoor Javed', '643'],
  ]),
  'Artificial Intelligence & Data Science': buildExtensionLookup([
    ['Dr. Ahmad Din', '3500'],
    ['Dr. Waseem Shahzad', '1000'],
    ['Dr. Hasan Mujtaba', '3100'],
    ['Dr. Mirza Omer Beg', '3503'],
    ['Dr. Muhammad Asif Naeem', '3502'],
    ['Dr. M. Ishtiaq', '3504'],
    ['Dr. Muhammad Nouman Noor', '3505'],
    ['Dr. Zohair Ahmed', '3539'],
    ['Dr. Adil Majeed', '3513'],
    ['Dr. Noshina Tariq', '3506'],
    ['Dr. Muhammad Mateen Yaqoob', '3508'],
    ['Mr. Shoaib Saleem Khattak', '3510'],
    ['Ms. Saira Qamar', '3514'],
    ['Ms. Umarah Qaseem', '3523'],
    ['Mr. Ahmad Raza', '3515'],
    ['Mr. Ubaid Ur Rehman', '3542'],
    ['Ms. Laraib Afzaal', '3525'],
    ['Mr. Usama Imtiaz', '3522'],
    ['Mr. Muhammad Sohail Abbas', '3521'],
    ['Ms. Mehreen Javaid', '3511'],
    ['Ms. Kanza Hamid', '3520'],
    ['Ms. Mahnoor Tariq', '3516'],
    ['Ms. Azka Atiq', '3526'],
    ['Ms. Kainat Iqbal', '3517'],
    ['Ms. Khadija Mahmood', '307'],
    ['Mr. Mohsin Khan', '3524'],
    ['Mr. Shahbaz Hassan', '3518'],
    ['Mr. Talha Tariq', '3537'],
    ['Mr. Muhammad Ammar Masood', '3529'],
    ['Ms. Maryam Hussain', '3528'],
    ['Mr. Ali Hamza', '3536'],
    ['Ms. Mubrra Asma', '3531'],
    ['Ms. Nabeelah Maryam', '3534'],
    ['Mr. Abdul Hammad Rasheed', '3527'],
    ['Ms. Palwasha Zahid', '3533'],
  ]),
  'Software Engineering': buildExtensionLookup([
    ['Dr. Usman Habib', '3400'],
    ['Dr. Naveed Ahmad', '645'],
    ['Dr. Atif Aftab Ahmed Jilani', '3403'],
    ['Dr. Shahela Saif', '3407'],
    ['Dr. Isma ul Hassan', '699'],
    ['Dr. Muhammad Bilal', '3409'],
    ['Dr. Uzma Mahar', '643'],
    ['Dr. Asif Muhammad', '3405'],
    ['Dr. Zeshan Khan', '3408'],
    ['Ms. Nigar Azhar Butt', '3415'],
    ['Mr. Irfan Ullah', '609'],
    ['Ms. Laiba Imran', '268'],
    ['Mr. Bilal Khalid Dar', '698'],
    ['Ms. Zoya Sumbul Zaheer', '3425'],
    ['Mr. Pir Sami Ullah Shah', '3414'],
    ['Ms. Hifza Umer', '307'],
    ['Ms. Arige Anjum', '3424'],
  ]),
  'Cyber Security': buildExtensionLookup([
    ['Dr. Qaisar Shafi', '3300'],
    ['Dr. Muhammad Asim', '3322'],
    ['Dr. Subhan Ullah', '3323'],
    ['Dr. Zafar Iqbal Abbasi', '3303'],
    ['Dr. Sana Aurangzeb', '3305'],
    ['Mr. Jawad Hassan Nisar', '3307'],
    ['Ms. Amina Siddique', '342'],
    ['Ms. Hina Binte Haq', '512'],
    ['Mr. Mehmood ul Hassan', '3309'],
    ['Ms. Sadia Saad', '307'],
    ['Mr. Arslan Aslam', '3312'],
    ['Ms. NAVEEN KHAN', '1'],
  ]),
};

const humanitiesOfficeLookup = buildOfficeLookup([
  ['Dr. Khadija Farooq', 'B-212'],
  ['Dr. Syed Irfan Shah', 'B-205'],
  ['Dr. M. Usman Ashraf', 'B-206'],
  ['Dr. Muhammad Tayyeb Nadeem', 'B-202'],
  ['Dr. Hamda Khan', 'B-201'],
  ['Dr. Muhammad Ali', 'B-203'],
  ['Ms. Aisha Ijaz', 'B-208'],
  ['Ms. Sumayyah Malik', 'A-307'],
  ['Mr. Shahzad Mahmood', 'B-204'],
  ['Mr. Khalil Ullah', 'B-118'],
  ['Dr. Farah Jabeen Awan', 'A-215-G'],
  ['Dr. Mehwish Hassan', 'B-209'],
  ['Ms. Memoona Rasool', 'A-114G'],
  ['Ms. Tayyaba Waseem', 'B-225'],
  ['Ms. Sumera Abbas', 'G-111'],
  ['Ms. Sanaa Ilyas', 'A-216G'],
  ['Ms. Sadia Nauman', 'B-220'],
  ['Dr. Sehrish Hassan Shigri', 'A-111E'],
  ['Ms. Maria Mazhar', 'B-225'],
  ['Ms. Mehreen', 'B-231'],
  ['Ms. Hajra Khalid', 'B-220'],
  ['Mr. Muhammad Ibrahim', 'B-215'],
  ['Mr. Hafiz Muhammad Hammad', 'B-215'],
  ['Mr. Hasham Ahmad', 'B-226'],
  ['Mr. Muhammad Saqib', 'B-215'],
  ['Mr. Muhammad Ajmal Khan', 'B-226'],
  ['Mr. Faisal ur Rehman', 'B-215'],
  ['Ms. Lubna', 'B-225'],
  ['Mr. Abdul Basit', 'B-117'],
]);

const engineeringFaculty = [
  {
    name: 'Dr. Muhammad Tariq',
    designation: 'Professor, HoS (FSE) & HoD (Computer Engineering)',
    extension: '4000',
    email: 'tariq.khan@nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Mr. Shehzad Ahmad',
    designation: 'Assistant Professor',
    extension: '361',
    email: 'shehzad.ahmad@nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Dr. Shahid Qureshi',
    designation: 'Assistant Professor',
    extension: '185',
    email: 'shahid.qureshi@nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Dr. M. Ibrar Khan',
    designation: 'Assistant Professor',
    extension: '185',
    email: 'ibrar.khan@nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Mr. Muhammad Hammad',
    designation: 'Lecturer',
    extension: '',
    email: 'muhammad.hammad@isb.nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Ms. Sana Saleh',
    designation: 'Lecturer',
    extension: '105',
    email: 'sana.saleh@nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Ms. Maryam Zafar',
    designation: 'Lab Engineer',
    extension: '529',
    email: 'maryam.zafar@isb.nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Mr. Fasih Ahmad Janjua',
    designation: 'Lab Engineer',
    extension: '529',
    email: 'fasih.ahmad@isb.nu.edu.pk',
    department: 'Computer Engineering',
  },
  {
    name: 'Ms. Tooba',
    designation: 'Lab Engineer',
    extension: '529',
    email: '',
    department: 'Computer Engineering',
  },
  {
    name: 'Dr. Niaz Ahmed',
    designation: 'Associate Professor & HoD (Electrical Engineering)',
    extension: '4111',
    email: 'niaz.ahmed@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Mukhtar Ullah',
    designation: 'Professor & Dean Engineering',
    extension: '104',
    email: 'mukhtar.ullah@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Rashad Ramzan',
    designation: 'Professor',
    extension: '386',
    email: 'rashad.ramzan@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Hassan Saif',
    designation: 'Assistant Professor',
    extension: '',
    email: 'hassan.saif@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Shahzad Saleem',
    designation: 'Assistant Professor',
    extension: '4106',
    email: 'shahzad.saleem@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Aamer Hafeez',
    designation: 'Assistant Professor',
    extension: '108',
    email: 'aamer.hafeez@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Muhammad Saeed',
    designation: 'Assistant Professor',
    extension: '365',
    email: 'muhammad.saeed@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Irum Saba',
    designation: 'Assistant Professor',
    extension: '253',
    email: 'irum.saba@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Farhan Khalid',
    designation: 'Assistant Professor',
    extension: '188',
    email: 'farhan.khalid@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Aamer Munir',
    designation: 'Assistant Professor (MS)',
    extension: '189',
    email: 'aamer.munir@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Fakhar Abbas',
    designation: 'Lecturer',
    extension: '261',
    email: 'fakhar.abbas@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Ms. Maria Nasir',
    designation: 'Lecturer',
    extension: '123',
    email: 'maria.nasir@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Ms. Nimra Fatima',
    designation: 'Lab Engineer',
    extension: '123',
    email: 'nimra.fatima@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Muhammad Awais',
    designation: 'Assistant Professor',
    extension: '4104',
    email: 'm.awais@nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Hazrat Ali',
    designation: 'Lab Engineer',
    extension: '4121',
    email: 'hazrat.ali@isb.nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Abu Bakar',
    designation: 'Lab Engineer',
    extension: '4121',
    email: 'abu.bakar@isb.nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Muhammad Abd Ur Rehman',
    designation: 'Lab Engineer',
    extension: '123',
    email: 'abdur.rehman@isb.nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Mr. Burhan Naeem',
    designation: 'Lab Engineer',
    extension: '4121',
    email: 'burhan.naeem@isb.nu.edu.pk',
    department: 'Electrical Engineering',
  },
  {
    name: 'Ms. Deema Zargoon Talib',
    designation: 'Lab Engineer',
    extension: '',
    email: 'deema.zargoon@isb.nu.edu.pk',
    department: 'Electrical Engineering',
  },
].map((facultyMember) =>
  createRecord({
    ...facultyMember,
    office: getOffice(engineeringOfficeLookup, facultyMember.name),
    school: 'engineering',
  }),
);

const businessFaculty = [
  {
    name: 'Dr. Aneka Fahima Sufi',
    designation: 'HoD (Management Sciences) & Assistant Professor',
    extension: '4100',
    email: 'aneka.fahima@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Sadia Nadeem',
    designation: 'Professor, Dean (MS) & HOS (MS)',
    extension: '182',
    email: 'sadia.nadeem@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Muhammad Abbas',
    designation: 'Professor',
    extension: '5114',
    email: 'muhammad.abbas@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Haider Ali',
    designation: 'Associate Professor',
    extension: '218',
    email: 'haider.ali@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Muhammad Adeel Anwer',
    designation: 'Associate Professor',
    extension: '',
    email: 'adeel.anwer@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Abdul Wahab',
    designation: 'Assistant Professor',
    extension: '305',
    email: 'abdulwahab@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Qurrat ul ain',
    designation: 'Assistant Professor',
    extension: '202',
    email: 'qurrat.ain@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Danial Hasan',
    designation: 'Assistant Professor',
    extension: '137',
    email: 'danial.hassan@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Muhammad Nadeem Sarwar',
    designation: 'Assistant Professor',
    extension: '',
    email: 'nadeem.sarwar@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Sarah Khan',
    designation: 'Assistant Professor',
    extension: '5116',
    email: 'sara.khan@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Sajjad Hussain',
    designation: 'Assistant Professor',
    extension: '5115',
    email: 'sajjad.hussain@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Hamnah Rahat',
    designation: 'Assistant Professor',
    extension: '',
    email: 'hamnah.rahat@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Usman Zafar Chaudhry',
    designation: 'Assistant Professor',
    extension: '',
    email: 'usman.chaudhry@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Aftab Bhatti',
    designation: 'Assistant Professor',
    extension: '5110',
    email: 'aftab.bhatti@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Hammad Majeed',
    designation: 'Assistant Professor (MS)',
    extension: '267',
    email: 'h.majeed@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Ayesha Yaqoob',
    designation: 'Lecturer',
    extension: '175',
    email: 'ayesha.yaqoob@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Muhammad Qaiser Shafi',
    designation: 'Lecturer',
    extension: '203',
    email: 'qaiser.shafi@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Sidra Abbas',
    designation: 'Lecturer',
    extension: '337',
    email: 'sidra.abbas@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Mansoor Mushtaq',
    designation: 'Lecturer',
    extension: '5125',
    email: 'mansoor.mushtaq@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Aamina Mukhtar Sheikh',
    designation: 'Lecturer',
    extension: '175',
    email: 'aamina.sheikh@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Abdul Wahab Tahir',
    designation: 'Lecturer',
    extension: '302',
    email: 'abdulwahab.tahir@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Syed Muhammad Kashif Raza',
    designation: 'Lecturer',
    extension: '322',
    email: 'kashif.raza@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Asma Masood Malik',
    designation: 'Lecturer',
    extension: '5122',
    email: 'asma.masood@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Mehmood Ur Rehman',
    designation: 'Lecturer',
    extension: '',
    email: 'mehmood.rehman@nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Sumaira Ghafoor',
    designation: 'Lecturer',
    extension: '355',
    email: 'sumaira.ghafoor@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Adnan Feroz Rana',
    designation: 'Instructor',
    extension: '',
    email: 'adnan.feroz@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Abdul Mannan',
    designation: 'Instructor',
    extension: '319',
    email: 'abdul.mannan@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Ali Hassan',
    designation: 'Instructor',
    extension: '',
    email: 'ali.hassan@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Hafiz Muhammad Awais Riaz',
    designation: 'Instructor',
    extension: '',
    email: 'awais.riaz@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Mueed Ahmad',
    designation: 'Instructor',
    extension: '611',
    email: 'mueed.ahmad@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Imad Ahmad',
    designation: 'Instructor',
    extension: '319',
    email: 'muhammad.imad@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Mr. Muhammad Arfeen Gohar',
    designation: 'Lecturer',
    extension: '',
    email: 'arfeen.gohar@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Samiya Hameed',
    designation: 'Lecturer',
    extension: '341',
    email: 'samiya.hameed@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Ms. Areeba Adnan',
    designation: 'Instructor',
    extension: '',
    email: 'areeba.adnan@isb.nu.edu.pk',
    department: 'Management Sciences',
  },
  {
    name: 'Dr. Falak Khan',
    designation: 'HoD (Accounting and Finance) & Assistant Professor',
    extension: '4100',
    email: 'falak.khan@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Muhammad Hanif Akhtar',
    designation: 'Professor',
    extension: '5126',
    email: 'hanif.akhtar@isb.nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Muhammad Akhtar',
    designation: 'Associate Professor',
    extension: '205',
    email: 'muhammad.akhtar@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Usama Arshad',
    designation: 'Assistant Professor',
    extension: '',
    email: 'usama.arshad@isb.nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Rameeza Andleeb',
    designation: 'Assistant Professor',
    extension: '355',
    email: 'rameeza.andleeb@isb.nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Rehan Aftab',
    designation: 'Assistant Professor',
    extension: '',
    email: 'rehan.aftab@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Dr. Muhammad Bilal Saeed',
    designation: 'Assistant Professor',
    extension: '146',
    email: 'bilalsaeed@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Ms. Amna Farooqui Arsalan',
    designation: 'Assistant Professor (MS)',
    extension: '355',
    email: 'amna.farooqui@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Mr. Sajjad Hanif',
    designation: 'Lecturer',
    extension: '604',
    email: 'sajjad.hanif@nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Ms. Syeda Hoor ul ain Ali',
    designation: 'Instructor',
    extension: '206',
    email: 'syeda.hoor@isb.nu.edu.pk',
    department: 'Accounting & Finance',
  },
  {
    name: 'Ms. Aleena Nadeem',
    designation: 'Lecturer',
    extension: '5139',
    email: 'aleena.nadeem@isb.nu.edu.pk',
    department: 'Accounting & Finance',
  },
].map((facultyMember) =>
  createRecord({
    ...facultyMember,
    office: getOffice(businessOfficeLookup, facultyMember.name),
    school: 'business',
  }),
);

const humanitiesFaculty = [
  {
    name: 'Dr. Khadija Farooq',
    designation: 'Incharge (Sciences & Humanities) & Assistant Professor',
    extension: '6100',
    email: 'khadija.farooq@nu.edu.pk',
  },
  {
    name: 'Dr. Syed Irfan Shah',
    designation: 'Professor',
    extension: '6108',
    email: 'irfan.shah@nu.edu.pk',
  },
  {
    name: 'Dr. M. Usman Ashraf',
    designation: 'Professor',
    extension: '6112',
    email: 'usman.ashraf@nu.edu.pk',
  },
  {
    name: 'Dr. Muhammad Tayyeb Nadeem',
    designation: 'Professor',
    extension: '6106',
    email: 'tayyeb.nadeem@nu.edu.pk',
  },
  {
    name: 'Dr. Hamda Khan',
    designation: 'Associate Professor',
    extension: '362',
    email: 'hamda.khan@nu.edu.pk',
  },
  {
    name: 'Dr. Muhammad Ali',
    designation: 'Associate Professor',
    extension: '357',
    email: 'm.ali@nu.edu.pk',
  },
  {
    name: 'Ms. Aisha Ijaz',
    designation: 'Assistant Professor',
    extension: '362',
    email: 'aisha.ijaz@nu.edu.pk',
  },
  {
    name: 'Ms. Sumayyah Malik',
    designation: 'Assistant Professor',
    extension: '6125',
    email: 'sumayyah.malik@nu.edu.pk',
  },
  {
    name: 'Mr. Shahzad Mahmood',
    designation: 'Assistant Professor',
    extension: '209',
    email: 'shahzad.mahmood@nu.edu.pk',
  },
  {
    name: 'Mr. Khalil Ullah',
    designation: 'Assistant Professor',
    extension: '358',
    email: 'khalil.awan@nu.edu.pk',
  },
  {
    name: 'Dr. Farah Jabeen Awan',
    designation: 'Assistant Professor',
    extension: '105',
    email: 'farah.awan@nu.edu.pk',
  },
  {
    name: 'Dr. Mehwish Hassan',
    designation: 'Assistant Professor',
    extension: '363',
    email: 'mehwish.hassan@nu.edu.pk',
  },
  {
    name: 'Ms. Memoona Rasool',
    designation: 'Assistant Professor',
    extension: '6115',
    email: 'maimoona.rasool@nu.edu.pk',
  },
  {
    name: 'Ms. Tayyaba Waseem',
    designation: 'Lecturer',
    extension: '',
    email: 'tayyaba.waseem@isb.nu.edu.pk',
  },
  {
    name: 'Ms. Zunera Malik',
    designation: 'Lecturer',
    extension: '382',
    email: 'zunaira.malik@nu.edu.pk',
  },
  {
    name: 'Ms. Sumera Abbas',
    designation: 'Lecturer',
    extension: '388',
    email: 'sumera.abbas@nu.edu.pk',
  },
  {
    name: 'Ms. Sanaa Ilyas',
    designation: 'Lecturer',
    extension: '6114',
    email: 'sanaa.ilyas@nu.edu.pk',
  },
  {
    name: 'Ms. Sadia Nauman',
    designation: 'Lecturer',
    extension: '6118',
    email: 'sadia.nauman@nu.edu.pk',
  },
  {
    name: 'Dr. Sehrish Hassan Shigri',
    designation: 'Lecturer',
    extension: '257',
    email: 'sehrish.hassan@nu.edu.pk',
  },
  {
    name: 'Ms. Maria Mazhar',
    designation: 'Lecturer',
    extension: '530',
    email: 'maria.mazhar@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Muhammad Waqar Ahmad Khan',
    designation: 'Lecturer',
    extension: '',
    email: 'waqar.ahmad@isb.nu.edu.pk',
  },
  {
    name: 'Ms. Mehreen',
    designation: 'Lecturer',
    extension: '',
    email: 'mehreen@nu.edu.pk',
  },
  {
    name: 'Ms. Hajra Khalid',
    designation: 'Lecturer',
    extension: '638',
    email: 'hajra.khalid@nu.edu.pk',
  },
  {
    name: 'Ms. Tehmina Ejaz',
    designation: 'Lecturer',
    extension: '374',
    email: 'tehmina.ejaz@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Muhammad Ibrahim',
    designation: 'Lecturer',
    extension: '394',
    email: 'm.ibraheem@nu.edu.pk',
  },
  {
    name: 'Mr. Hafiz Muhammad Hammad',
    designation: 'Lecturer',
    extension: '394',
    email: 'hafiz.hammad@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Hasham Ahmad',
    designation: 'Lecturer',
    extension: '6121',
    email: 'hasham.ahmad@nu.edu.pk',
  },
  {
    name: 'Mr. Muhammad Saqib',
    designation: 'Lecturer',
    extension: '394',
    email: 'muhammad.saqib@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Muhammad Ajmal Khan',
    designation: 'Lecturer',
    extension: '388',
    email: 'muhammad.ajmal@nu.edu.pk',
  },
  {
    name: 'Ms. Asefa Zareen Khilji',
    designation: 'Lecturer',
    extension: '612',
    email: 'asefa.zareen@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Faisal ur Rehman',
    designation: 'Lecturer',
    extension: '394',
    email: 'faisal.rehman@isb.nu.edu.pk',
  },
  {
    name: 'Ms. Lubna',
    designation: 'Lecturer',
    extension: '',
    email: 'lubna@nu.edu.pk',
  },
  {
    name: 'Mr. Muhammad Umer',
    designation: 'Instructor',
    extension: '',
    email: 'muhammad.umer@isb.nu.edu.pk',
  },
  {
    name: 'Mr. Abdul Basit',
    designation: 'Instructor',
    extension: '',
    email: 'abdul.basit@isb.nu.edu.pk',
  },
].map((facultyMember) =>
  createRecord({
    ...facultyMember,
    office: getOffice(humanitiesOfficeLookup, facultyMember.name),
    school: 'humanities',
    department: 'Sciences & Humanities',
  }),
);

const legacyComputingFaculty = legacyFacultyData
  .filter(({ department }) => department !== 'Faculty Department of Science And Humanities')
  .flatMap(({ department, faculty }) =>
    faculty.map((facultyMember) => {
      const departmentName = department.replace(/^Faculty Department of /, '');

      return createRecord({
        name: facultyMember.name,
        designation: facultyMember.designation,
        email: facultyMember.email,
        office: facultyMember['office#'],
        extension: getExtension(computingExtensionLookup[departmentName] || {}, facultyMember.name),
        school: 'computing',
        department: departmentName,
      });
    }),
  );

export const schoolOptions = [
  { value: 'all', label: 'All Faculty' },
  { value: 'computing', label: SCHOOL_LABELS.computing },
  { value: 'engineering', label: SCHOOL_LABELS.engineering },
  { value: 'business', label: SCHOOL_LABELS.business },
  { value: 'humanities', label: SCHOOL_LABELS.humanities },
];

export const facultyDirectory = [
  ...legacyComputingFaculty,
  ...engineeringFaculty,
  ...businessFaculty,
  ...humanitiesFaculty,
].sort((left, right) => left.name.localeCompare(right.name));
