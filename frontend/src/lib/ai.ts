// src/lib/ai.ts

/**
 * AI helper that streams financial insights.
 * Supports OpenAI's Chat Completion API (gpt-4o-mini).
 * The function returns a ReadableStream of text chunks.
 */

/**
 * Build the prompt according to the insight type.
 */
function buildPrompt(type: string, payload: any): string {
  switch (type) {
    case 'spending':
      return `You are a financial analyst. Analyze the user's spending patterns given the following data and return a concise bullet‑point summary. Data: ${JSON.stringify(payload)}`;
    case 'savings':
      return `Predict the user's potential savings over the next 6 months based on their income, expenses, and current savings. Data: ${JSON.stringify(payload)}`;
    case 'emi':
      return `Provide an EMI recommendation, highlighting total cost, interest paid, and best repayment strategy. Data: ${JSON.stringify(payload)}`;
    case 'recommendations':
      return `Generate smart financial recommendations for the user based on their financial health, goals, and recent transactions. Data: ${JSON.stringify(payload)}`;
    case 'health':
      return `Calculate a financial health score (0‑100) and give a short justification. Data: ${JSON.stringify(payload)}`;
    default:
      return `Provide a generic financial insight based on the data: ${JSON.stringify(payload)}`;
  }
}

/**
 * Stream insight using OpenAI Chat Completion API.
 * Returns a ReadableStream of plain‑text chunks.
 */
export async function streamInsight(
  type: string,
  payload: any,
  userId: string
): Promise<ReadableStream> {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = buildPrompt(type, payload);

  if (!apiKey) {
    const encoder = new TextEncoder();
    const fallbackText = `Mock insight for ${type}: This is a simulated financial insight powered by local mock data. Use OPENAI_API_KEY for real AI responses.`;
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fallbackText));
        controller.close();
      },
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  // The OpenAI stream is a series of "data: {…}\n\n" lines.
  // We'll pipe it directly as a ReadableStream.
  const reader = response.body!.getReader();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Decode chunk and split by newlines.
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const json = line.replace('data: ', '').trim();
          if (json === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const data = JSON.parse(json);
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          } catch (_) {
            // ignore malformed lines
          }
        }
      }
      controller.close();
    },
  });

  return stream;
}
