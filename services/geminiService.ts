
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight, UserProfile } from "../types";

// Fix: Initializing GoogleGenAI exactly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsights(
  transactions: Transaction[],
  profile: UserProfile
): Promise<AIInsight[]> {
  try {
    const prompt = `
      Como um estrategista financeiro avançado do "cifra.ia", analise:
      
      Perfil: Renda de R$${profile.monthlyIncome}, Gastos Fixos de R$${profile.fixedExpenses}.
      Transações: ${JSON.stringify(transactions)}
      
      Diretrizes:
      1. Identifique riscos no uso excessivo de Cartão de Crédito vs Pix/Débito.
      2. Avalie se o usuário está investindo uma porcentagem saudável da renda (objetivo > 10%).
      3. Seja direto, use "você" e mantenha um tom premium e motivador.
      4. Identifique categorias com gastos anômalos.
      
      Retorne APENAS JSON: { "insights": [ { "title": string, "description": string, "type": "alert" | "success" | "info" } ] }
    `;

    // Fix: Ensuring configuration adheres to guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["alert", "success", "info"] }
                },
                required: ["title", "description", "type"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    // Fix: Accessing .text property directly (not as a function) as per guidelines
    const data = JSON.parse(response.text || '{ "insights": [] }');
    return data.insights;
  } catch (error) {
    return [
      {
        title: "Inteligência Ativa",
        description: "Continue registrando seus gastos por forma de pagamento para uma análise de crédito detalhada.",
        type: "info"
      }
    ];
  }
}
