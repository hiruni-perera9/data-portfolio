// app/api/chat/route.js

import { NextResponse } from "next/server";
import { searchDinosaur, getFossilOccurrences, getTaxonDetails } from "@/lib/paleodb";
import { detectMode, generateResponse, extractDinosaurName } from "@/lib/gemini";

export async function POST(request) {
    try{
        // Get message from frontend
        const {message, mode: userSelectedMode} = await request.json();

        if (!message){
            return NextResponse.json(
                {error: 'Message is required'},
                {status: 400}
            );
        }

        // Step 1: Detect Mode
        const mode = userSelectedMode || await detectMode(message);

        // Step 2: Use AI to extract dinosaur name
        const dinoName = await extractDinosaurName(message);
        console.log('Extracted dinosaur name:', dinoName); // Debug
        
        let paleoData = {};

        // Step 3: Query PaleoDB
        if (dinoName){
            try {
                const taxaData = await searchDinosaur(dinoName);
                console.log('PaleoDB taxa results:', taxaData.records?.length || 0, 'records');
                
                if (taxaData.records && taxaData.records.length > 0) {
                const baseTaxon = taxaData.records[0];
                let detailedTaxa = baseTaxon;
                if (baseTaxon?.oid) {
                    const detailResponse = await getTaxonDetails(baseTaxon.oid);
                    if (detailResponse?.records && detailResponse.records.length > 0) {
                        detailedTaxa = detailResponse.records[0];
                    }
                }
                paleoData.taxa = detailedTaxa;
                console.log('Found taxa:', paleoData.taxa.nam); // Debug
                
                // Get fossil occurrences if in technical mode
                if (mode === 'technical') {
                    const occurrences = await getFossilOccurrences(dinoName);
                    paleoData.occurrences = occurrences.records || [];
                    console.log('Found occurrences:', paleoData.occurrences.length);
                }
                } else {
                console.log('No PaleoDB records found for:', dinoName);
                }
            } catch (paleoError) {
                console.error('PaleoDB error:', paleoError);
            }
        }
            

        // Step 4: Generate AI response
        const aiResponse = await generateResponse(message, paleoData, mode);

        // Step 5: Return response to frontend
        return NextResponse.json({
            response: aiResponse,
            mode: mode,
            paleoData: paleoData,
            detectedDinosaur: dinoName,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Someting went wrong. Please try again.'},
            { status: 500}
        );
    }
    
}
