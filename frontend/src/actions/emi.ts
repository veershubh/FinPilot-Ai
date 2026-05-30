"use server";
import "server-only";
import { groq } from '@/lib/groq';


export async function analyzeEMI(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn('Missing GROQ_API_KEY');

      return {
        success: false,
        aiAvailable: false,
        analysis: null,
      };
    }

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return {
      success: true,
      aiAvailable: true,
      analysis: completion.choices[0]?.message?.content ?? 'No analysis generated.',
    };
  } catch (error) {
    console.error('Groq AI Error:', error);

    return {
      success: false,
      aiAvailable: false,
      analysis: null,
    };
  }
}