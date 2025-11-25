const {
  searchDinosaur,
  getFossilOccurrences,
  getTaxonDetails,
  getTimeInterval
} = require("./paleoAPI.js"); // make sure this path is correct

async function runTests() {
  try {
    console.log("============== TEST 1: searchDinosaur ==================");
    const dinoData = await searchDinosaur("Tyrannosaurus");
    console.log("Test 1 - keys on root object:", Object.keys(dinoData));
    console.log("Test 1 - number of records:", dinoData.records ? dinoData.records.length : "no 'records' field");
    console.log("Test 1 - first record preview:");
    console.dir(dinoData.records?.[0], { depth: 3 });

    console.log("\n============== TEST 2: getFossilOccurrences =============");
    const occData = await getFossilOccurrences("Tyrannosaurus");
    console.log("Test 2 - keys on root object:", Object.keys(occData));
    console.log("Test 2 - number of records:", occData.records ? occData.records.length : "no 'records' field");
    console.log("Test 2 - first record preview:");
    console.dir(occData.records?.[0], { depth: 3 });

    const firstRecord = dinoData?.records?.[0];
    const exampleId = firstRecord?.oid || firstRecord?.taxon_no;

    console.log("\n============== TEST 3: getTaxonDetails ==================");
    if (exampleId) {
      console.log("Using taxon ID:", exampleId);
      const detailData = await getTaxonDetails(exampleId);
      console.log("Test 3 - keys on root object:", Object.keys(detailData));
      console.log("Test 3 - full response preview:");
      console.dir(detailData, { depth: 4 });
    } else {
      console.log("No taxon ID found in Test 1, skipping Test 3.");
    }

    console.log("\n============== TEST 4: getTimeInterval ==================");
    const intervalData = await getTimeInterval("Cretaceous");
    console.log("Test 4 - keys on root object:", Object.keys(intervalData));
    console.log("Test 4 - full response preview:");
    console.dir(intervalData, { depth: 4 });

  } catch (err) {
    console.error("Test file error:", err);
  }
}

runTests();
