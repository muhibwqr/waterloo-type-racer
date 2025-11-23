// List of valid universities (extracted from email domain mapping)
export const UNIVERSITIES = [
  // Canadian Universities
  "University of Waterloo",
  "University of Toronto",
  "McGill University",
  "University of British Columbia",
  "Queen's University",
  "McMaster University",
  "Western University",
  "University of Alberta",
  "University of Calgary",
  "Simon Fraser University",
  "York University",
  "Carleton University",
  "University of Ottawa",
  "Concordia University",
  "Dalhousie University",
  "University of New Brunswick",
  "University of Victoria",
  "University of Saskatchewan",
  "University of Manitoba",
  
  // US Universities
  "Harvard University",
  "Massachusetts Institute of Technology",
  "Stanford University",
  "UC Berkeley",
  "UCLA",
  "University of Southern California",
  "New York University",
  "Columbia University",
  "Cornell University",
  "Princeton University",
  "Yale University",
  "University of Pennsylvania",
  "University of Chicago",
  "Northwestern University",
  "Duke University",
  "University of Michigan",
  "University of Illinois Urbana-Champaign",
  "Georgia Institute of Technology",
  "Carnegie Mellon University",
  
  // UK Universities
  "University of Oxford",
  "University of Cambridge",
  "Imperial College London",
  "University College London",
  "London School of Economics",
  "University of Edinburgh",
  "University of Manchester",
  "University of Bristol",
  "University of Warwick",
  
  // Australian Universities
  "University of New South Wales",
  "University of Melbourne",
  "University of Sydney",
  "Australian National University",
  "University of Queensland",
] as const;

export type University = typeof UNIVERSITIES[number];

export const isValidUniversity = (university: string): university is University => {
  return UNIVERSITIES.includes(university as University);
};

