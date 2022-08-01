/**
 * Funtions for working with Bing Maps API.
 */
// TODO: test all of the functions
const Chain = require('../models/Chain');

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const validAddress = async (address) => {
    const coordsData = await axios.get(`https://dev.virtualearth.net/REST/v1/Locations/` + 
    encodeURIComponent(req.body.address) + 
    `?&key=${process.env.BING_MAPS_API_KEY}`)
    return coordsData?.data.resourceSets[0].estimatedTotal > 0 && coordsData.data.resourceSets[0].resources[0].confidence === "High";
}

const coordinatesOfAddress = async (address) => {
    const coordsData = await axios.get(`https://dev.virtualearth.net/REST/v1/Locations/` + 
    encodeURIComponent(req.body.address) + 
    `?&key=${process.env.BING_MAPS_API_KEY}`)
    return coordsData?.data.resourceSets[0].resources[0].point.coordinates;
} 

const updateClosestStores = async (customer, coordinates, address, chain_id) => {
    // add closest stores to new customer
    const chain = await Chain.findOne({_id: chain_id})
    // calculate distance from address to each store
    chain.stores.forEach((value, key) => {
        chain.stores.set(key, [...value, Math.sqrt((coordinates[0] - value[0]) ** 2 + (coordinates[1] - value[1]) ** 2)])
    })
    // sort stores by distance to address
    const sortedStores = new Map([...chain.stores.entries()].sort((a, b) => a[1][2] - b[1][2]));
    // get closest three stores absolute distance wise, and sort them by traveling distance 
    const threeStores = new Map();
    let i = 0;
    for (const [key, value] of sortedStores) {
        if (i === 3) return;
        const bingData = await axios.get(`https://dev.virtualearth.net/REST/v1/Routes?` + 
        `wp.1=${encodeURIComponent(address)}` + 
        `&wp.2=${encodeURIComponent(key)}` + 
        `&optimize=distance&ra=routeSummariesOnly&distanceUnit=mi` + 
        `&key=${process.env.BING_MAPS_API_KEY}`)
        const distance = bingData?.data.resourceSets[0].resources[0].travelDistance;
        threeStores.set(key, [...value, distance])
    }

    const closestStores = new Map([...threeStores.entries()].sort((a, b) => a[1][3] - b[1][3]));
    for (const [key, value] of closestStores) {
        customer.closestStores.set(key, value)
    }

    // save everything
    customer.save();
}

module.exports = {validAddress, coordinatesOfAddress, updateClosestStores}
