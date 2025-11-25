/**
 * This file handles the API call to the Paleobiology Database
 */

import axios from "axios";

const PALEODB_BASE_URL = "https://paleobiodb.org/data1.2"

/**
 * Search for dinosaur by name
 * @param {string} name - Dinosaur Name (e.g: Tyrannosaurus)
 * @param {Promise} - Data about the dinosaur 
 */

export async function searchDinosaur(name) {
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
        console.error('PaleoDB API Error:', error);
        throw error;
    }  
}

/**
 * Get fossil occurrences for a taxon
 * @param {string} taxonName - Scientific name
 * @returns {Promise} - Fossil occurrence data
 */

export async function getFossilOccurrences(taxonName, options = {}) {
  try {
    const {
      limit = 100,
      show = 'coords,loc,paleoloc,stratext',
      ...additionalParams
    } = options || {};

    const response = await axios.get(`${PALEODB_BASE_URL}/occs/list.json`, {
      params: {
        base_name: taxonName,
        show, // Location, geological and optional classification data
        limit,
        ...additionalParams
      }
    });

    return response.data;
  } catch (error) {
    console.error('PaleoDB occurrences error:', error);
    throw error;
  }
}

/**
 * Fetch detailed taxon data (ensures appearance/classification fields)
 * @param {number|string} taxonId - PaleoDB taxon identifier
 */
export async function getTaxonDetails(taxonId) {
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
    console.error('PaleoDB taxon detail error:', error);
    return null;
  }
}

/**
 * Get information about a geological time period
 * @params {string} intervalName - (e.g: Tyrannosaurus)
 * @returns {Promise} - Time interval data
 */

export async function getTimeInterval(IntervalName) {
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
