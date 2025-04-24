import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(req: NextRequest): Promise<{ file: File; skills: string }> {
  const formData = await req.formData();
  const file = formData.get('resume') as File;
  const skills = formData.get('skills') as string;
  return { file, skills };
}

export async function POST(req: NextRequest) {
  try {
    const { file, skills } = await parseFormData(req);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join('/tmp', `${uuidv4()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const uploaded = await ai.files.upload({ file: tempFilePath });

    // STEP 1: parse the resume
    const parseRes = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resume_details: {
              type: Type.OBJECT,
              properties: {
                current_role: { type: Type.STRING },
                field: { type: Type.STRING },
                job_description: { type: Type.STRING },
              },
            },
          },
        },
        systemInstruction: [
          {
            text: `youre a master resume parser - you need to parse the users given resume in correct format and extract the relevant data from it and for job_description - find it and describe it in details the role and the responsibilities of that the user is following - respond in structured json`,
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                fileUri: uploaded.uri,
                mimeType: uploaded.mimeType,
              },
            },
          ],
        },
      ],
    });

    const parsed = JSON.parse(await parseRes.text());

    // STEP 2: Analyze replaceability
    const evalRes = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replaceability_score: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            commentary: { type: Type.STRING },
          },
        },
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Based on the following resume details, analyze how likely it is that the user's role will be automated or replaced by AI in the near future.

Respond in this format:
{
  "replaceability_score": percentage between 0 and 100,
  "confidence": percentage between 0 and 100,
  "commentary": brutally honest one-liner on why or why not this job is safe from AI
}

Only respond with the JSON. Do not explain.

Here are the details:
${JSON.stringify(parsed)}
`,
            },
          ],
        },
      ],
    });

    const result = JSON.parse(await evalRes.text());
    return NextResponse.json({ ...parsed, ...result });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process your data' }, { status: 500 });
  }
}