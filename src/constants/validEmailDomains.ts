// Valid university email domains
export const VALID_EMAIL_DOMAINS = [
  // Canadian Universities
  "uwaterloo.ca",
  "utoronto.ca",
  "mcgill.ca",
  "ubc.ca",
  "queensu.ca",
  "mcmaster.ca",
  "uwo.ca",
  "ualberta.ca",
  "ucalgary.ca",
  "sfu.ca",
  "yorku.ca",
  "carleton.ca",
  "uottawa.ca",
  "concordia.ca",
  "dal.ca",
  "unb.ca",
  "uvic.ca",
  "usask.ca",
  "umanitoba.ca",
  
  // US Universities (common patterns)
  "edu",
  "harvard.edu",
  "mit.edu",
  "stanford.edu",
  "berkeley.edu",
  "ucla.edu",
  "usc.edu",
  "nyu.edu",
  "columbia.edu",
  "cornell.edu",
  "princeton.edu",
  "yale.edu",
  "upenn.edu",
  "uchicago.edu",
  "northwestern.edu",
  "duke.edu",
  "umich.edu",
  "uiuc.edu",
  "gatech.edu",
  "cmu.edu",
  
  // UK Universities
  "ac.uk",
  "ox.ac.uk",
  "cam.ac.uk",
  "imperial.ac.uk",
  "ucl.ac.uk",
  "lse.ac.uk",
  "ed.ac.uk",
  "manchester.ac.uk",
  "bristol.ac.uk",
  "warwick.ac.uk",
  
  // Australian Universities
  "edu.au",
  "unsw.edu.au",
  "unimelb.edu.au",
  "sydney.edu.au",
  "anu.edu.au",
  "uq.edu.au",
  
  // Other common patterns
  "university.edu",
  "college.edu",
  "school.edu",
];

// Check if email domain is valid
export const isValidEmailDomain = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@([^\s@]+)$/;
  const match = email.match(emailRegex);
  
  if (!match) return false;
  
  const domain = match[1].toLowerCase();
  
  // Check exact match or if domain ends with any valid domain
  return VALID_EMAIL_DOMAINS.some(validDomain => 
    domain === validDomain || domain.endsWith(`.${validDomain}`)
  );
};
