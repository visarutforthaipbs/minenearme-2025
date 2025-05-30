import { caseStudies, getCaseStudyById } from "../data/caseData";

// Log all case IDs
console.log("Available Case IDs:");
caseStudies.forEach((cs, index) => {
  console.log(`Case ${index + 1}: ID=${cs.id}, Title=${cs.title}`);
  console.log(`Timeline events: ${cs.timelineEvents?.length || 0}`);
  console.log("First event:", cs.timelineEvents?.[0]);
  console.log("---");
});

// Test getByID function
const testIds = ["case-1", "case-2", "nonexistent"];
testIds.forEach((id) => {
  console.log(`Testing lookup for ID: ${id}`);
  const result = getCaseStudyById(id);
  console.log(
    `Found: ${result ? `${result.id} - ${result.title}` : "Not found"}`
  );
  console.log("---");
});

export default {}; // Empty export to make this a module
