/**
 * This file handles the API call to the Paleobiology Database
 */

const axios = require("axios");

const PALEODB_BASE_URL = "https://paleobiodb.org/data1.2"

/**
 * Search for dinosaur by name
 * @param {string} name - Dinosaur Name (e.g: Tyrannosaurus)
 * @param {Promise} - Data about the dinosaur 
 */

async function searchDinosaur(name) {
    try{
        // Call PaleoDB API to search for taxa (organism names)
        const response = await axios.get(`${PALEODB_BASE_URL}/taxa/list.json`, {
            params: {
                name: name,
                rel: 'all_children', // Include all related species
                show: 'attr,app,size,class' // What data to return (no spaces per API spec)
            }
        });
        
        return response.data;
    } catch (error){
        throw error;
    }  
}

/**
 * Get fossil occurrences for a taxon
 * @param {string} taxonName - Scientific name
 * @returns {Promise} - Fossil occurrence data
 */

async function getFossilOccurrences(taxonName) {
  try {
    const response = await axios.get(`${PALEODB_BASE_URL}/occs/list.json`, {
      params: {
        base_name: taxonName,
        show: 'coords,loc,paleoloc,stratext', // Location and geological data
        limit: 100 // Max results
      }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch detailed taxon data (ensures appearance/classification fields)
 * @param {number|string} taxonId - PaleoDB taxon identifier
 */
async function getTaxonDetails(taxonId) {
  if (!taxonId) return null;

  try {
    const response = await axios.get(`${PALEODB_BASE_URL}/taxa/single.json`, {
      params: {
        id: taxonId,
        show: 'attr,app,size,class'
      }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Get information about a geological time period
 * @params {string} intervalName - (e.g: Tyrannosaurus)
 * @returns {Promise} - Time interval data
 */

async function getTimeInterval(IntervalName) {
    try{
        // Call PaleoDB API to search for interval (time period names)
        const response = await axios.get(`${PALEODB_BASE_URL}/intervals/list.json`, {
            params: {
                name: IntervalName
            }
        });
        
        return response.data;
    } catch (error){
        console.error('PaleoDB Interval Error:', error);
        throw error;
    }  
}

module.exports = {
  searchDinosaur,
  getFossilOccurrences,
  getTaxonDetails,
  getTimeInterval
};