import { NextRequest, NextResponse } from "next/server";
import {
    GoogleGenAI,
    Type,
} from '@google/genai';

interface aiResponse {
    resume_details: {
        current_role: string;
        job_description: string;
        field: string;
    };
}


interface analysisResponse {
    replaceability_score: number;
    confidence: number;
    commentary: string;
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const model = 'gemini-2.0-flash-lite';


async function parserAgent(files: any): Promise<aiResponse | null> {
    console.log("got these files ->> ", files)

    const config = {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                resume_details: {
                    type: Type.OBJECT,
                    properties: {
                        current_role: { type: Type.STRING },
                        job_description: { type: Type.STRING },
                        field: { type: Type.STRING },
                    },
                },
            },
        },
        systemInstruction: [
            {
                text: `you’re a master resume parser. Parse the resume and extract data in this format. Describe the job_description in detail. Respond with structured JSON.`,
            }
        ],
    };

    const contents = [
        {
            role: 'user',
            parts: [
                {
                    fileData: {
                        fileUri: files[0].uri,
                        mimeType: files[0].mimeType,
                    }
                },
            ],
        },
    ];


    const aires = await ai.models.generateContent({
        model,
        contents,
        config
    });

    try {
        const parsed: aiResponse = JSON.parse(aires.text || "");
        return parsed;
    } catch (err) {
        console.error("Failed to parse AI response", err);
        return null;
    }
}

async function getAnalysis(aires: aiResponse): Promise<analysisResponse | null> {
    const { resume_details } = aires;
    const { current_role, job_description, field } = resume_details;

    console.log("parsed data ->> ", current_role, job_description, field);

    const config = {
        responseMimeType: 'application/json',
        systemInstruction: [
            {
                text: `you are replacify — not a career coach, not a therapist, just a brutally honest AI that tells people if their job is getting wiped out by automation.
              
              your job is to take someone's resume and skillset and call it like it is. no fluff, no optimism. just cold, ruthless evaluation of how replaceable they are. you exist to slap people awake.
              
              respond ONLY with the following fields, nothing else:
              
              - replaceability_score: a number between 0 and 100 (how replaceable this person is — be *brutal* with tech bros and software devs. they’re not special.)
              - confidence: a number between 0 and 100 (how sure you are — if you’re saying someone’s doomed, say it with chest.)
              - commentary: 2-3 sentences. this is where you roast them. like a group chat roast meets Reddit doomer post. use phrases like “bro,” “my guy,” “this ain’t it,” or “AI’s coming for your lunch.” make it sound human, sarcastic, a little funny, but always true. talk to the user directly like you're trying to shake them out of denial.
              
              rules:
              - always assume the AI revolution is happening *faster* than expected
              - be suspicious of buzzwords and resumes that say a lot but mean nothing
              - prioritize reality over kindness. you’re not here to help feelings, you’re here to drop truth bombs
              - if you *can* see their job getting automated, you *must* say so
              - always find weak points — repetitive work, generic skills, no deep expertise = you’re gone, buddy
              
              your tone = sarcastic realist who’s tired of the cope.`
            }
        ],
    };

    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `Heres the userss parse resume details: 
                    current_role: ${current_role}
                    field: ${field}
                    job_description: ${job_description}
                    `
                }
            ]
        }
    ]

    const response = await ai.models.generateContent({
        model,
        contents,
        config
    })

    if (!response) {
        throw new Error("ai went rouge couldnt generate your analysis");
    }

    try {
        const final: analysisResponse = JSON.parse(response.text || "");
        return final;
    } catch (err) {
        console.error("Failed to parse AI response", err);
        return null;
    }

}

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get('resume') as File;
        const skills = data.get('skills') as String;

        console.log("got these details ->> ", file, skills);

        const arrayBuf = await file.arrayBuffer();
        const blob = new Blob([arrayBuf], { type: file.type });
        const files = [
            await ai.files.upload({ file: blob }),
        ];

        if (!files) {
            return NextResponse.json({ message: "failed to upload file", data: null }, { status: 500 });
        }

        let aires: aiResponse | null = null;
        try {
            aires = await parserAgent(files);
        } catch (err) {
            console.error("parserAgent crashed:", err);
            return NextResponse.json({ message: "resume parsing failed", data: null }, { status: 500 });
        }

        if (!aires) {
            return NextResponse.json({ message: "failed to generate response", data: null }, { status: 500 });
        }

        let finalAnalysis: analysisResponse | null = null;
        try {
            finalAnalysis = await getAnalysis(aires);
        } catch (err) {
            console.error("getAnalysis crashed:", err);
            return NextResponse.json({ message: "analysis generation failed", data: null }, { status: 500 });
        }

        if (!finalAnalysis) {
            return NextResponse.json({ message: "failed to generate response", data: null }, { status: 500 });
        }

        return NextResponse.json({ message: "success", data: finalAnalysis }, { status: 200 });
    } catch (err) {
        console.error("Unhandled error in POST route:", err);
        return NextResponse.json({ message: "server error", data: null }, { status: 500 });
    }
}