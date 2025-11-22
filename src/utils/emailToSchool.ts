// Map email domains to school names
const EMAIL_TO_SCHOOL_MAP: Record<string, string> = {
  // Canadian Universities
  "uwaterloo.ca": "University of Waterloo",
  "utoronto.ca": "University of Toronto",
  "mcgill.ca": "McGill University",
  "ubc.ca": "University of British Columbia",
  "queensu.ca": "Queen's University",
  "mcmaster.ca": "McMaster University",
  "uwo.ca": "Western University",
  "ualberta.ca": "University of Alberta",
  "ucalgary.ca": "University of Calgary",
  "sfu.ca": "Simon Fraser University",
  "yorku.ca": "York University",
  "carleton.ca": "Carleton University",
  "uottawa.ca": "University of Ottawa",
  "concordia.ca": "Concordia University",
  "dal.ca": "Dalhousie University",
  "unb.ca": "University of New Brunswick",
  "uvic.ca": "University of Victoria",
  "usask.ca": "University of Saskatchewan",
  "umanitoba.ca": "University of Manitoba",
  
  // US Universities
  "harvard.edu": "Harvard University",
  "mit.edu": "Massachusetts Institute of Technology",
  "stanford.edu": "Stanford University",
  "berkeley.edu": "UC Berkeley",
  "ucla.edu": "UCLA",
  "usc.edu": "University of Southern California",
  "nyu.edu": "New York University",
  "columbia.edu": "Columbia University",
  "cornell.edu": "Cornell University",
  "princeton.edu": "Princeton University",
  "yale.edu": "Yale University",
  "upenn.edu": "University of Pennsylvania",
  "uchicago.edu": "University of Chicago",
  "northwestern.edu": "Northwestern University",
  "duke.edu": "Duke University",
  "umich.edu": "University of Michigan",
  "uiuc.edu": "University of Illinois Urbana-Champaign",
  "gatech.edu": "Georgia Institute of Technology",
  "cmu.edu": "Carnegie Mellon University",
  
  // UK Universities
  "ox.ac.uk": "University of Oxford",
  "cam.ac.uk": "University of Cambridge",
  "imperial.ac.uk": "Imperial College London",
  "ucl.ac.uk": "University College London",
  "lse.ac.uk": "London School of Economics",
  "ed.ac.uk": "University of Edinburgh",
  "manchester.ac.uk": "University of Manchester",
  "bristol.ac.uk": "University of Bristol",
  "warwick.ac.uk": "University of Warwick",
  
  // Australian Universities
  "unsw.edu.au": "University of New South Wales",
  "unimelb.edu.au": "University of Melbourne",
  "sydney.edu.au": "University of Sydney",
  "anu.edu.au": "Australian National University",
  "uq.edu.au": "University of Queensland",
};

// Extract school name from email domain
export const getSchoolNameFromEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@([^\s@]+)$/;
  const match = email.match(emailRegex);
  
  if (!match) return "Unknown University";
  
  const domain = match[1].toLowerCase();
  
  // Check exact match first
  if (EMAIL_TO_SCHOOL_MAP[domain]) {
    return EMAIL_TO_SCHOOL_MAP[domain];
  }
  
  // Check if domain ends with a known subdomain pattern
  // e.g., student.uwaterloo.ca -> University of Waterloo
  for (const [knownDomain, schoolName] of Object.entries(EMAIL_TO_SCHOOL_MAP)) {
    if (domain.endsWith(`.${knownDomain}`)) {
      return schoolName;
    }
  }
  
  // Check common patterns
  if (domain.endsWith(".edu")) {
    // Extract university name from domain (e.g., example.university.edu -> University of Example)
    const parts = domain.split(".");
    if (parts.length >= 2) {
      const mainPart = parts[parts.length - 2];
      // Convert to title case
      const titleCase = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      return titleCase.endsWith(" University") ? titleCase : `${titleCase} University`;
    }
  }
  
  if (domain.endsWith(".ac.uk")) {
    const parts = domain.split(".");
    if (parts.length >= 2) {
      const mainPart = parts[parts.length - 3] || parts[parts.length - 2];
      const titleCase = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      return `University of ${titleCase}`;
    }
  }
  
  if (domain.endsWith(".edu.au")) {
    const parts = domain.split(".");
    if (parts.length >= 2) {
      const mainPart = parts[parts.length - 2];
      const titleCase = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      return `${titleCase} University`;
    }
  }
  
  // Default: format domain nicely
  const domainParts = domain.split(".");
  if (domainParts.length > 0) {
    const mainPart = domainParts[domainParts.length - 2] || domainParts[domainParts.length - 1];
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1) + " University";
  }
  
  return "Unknown University";
};

