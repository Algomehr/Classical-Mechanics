import { GoogleGenAI, Type } from "@google/genai";
import type { Solution } from "../types";

// اطمینان از وجود کلید API
if (!process.env.API_KEY) {
  throw new Error("متغیر محیطی API_KEY تنظیم نشده است");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const solutionSchema = {
  type: Type.OBJECT,
  properties: {
    explanation: {
      type: Type.STRING,
      description: "توضیح کامل و گام‌به‌گام فیزیک مسئله، معادلات حرکت و روش عددی انتخابی. باید از Markdown و LaTeX استفاده شود."
    },
    numericalCode: {
      type: Type.STRING,
      description: "بدنه یک تابع جاوااسکریپت که انتگرال‌گیری عددی (مانند RK4) را انجام داده و آرایه‌ای از نقاط داده مانند {t, x, y, vx, vy, ...} را برمی‌گرداند. باید حداقل ۲۰۰ نقطه برای رسم نمودار تولید شود. خط آخر باید `return data_array;` باشد."
    },
    simulationCode: {
      type: Type.STRING,
      description: "یک عبارت تابع ارو فانکشن (arrow function) جاوااسکریپت برای رندر انیمیشن دو بعدی روی بوم (canvas). امضای تابع باید به شکل `(ctx, data, time, canvas) => { ... }` باشد."
    },
  },
  required: ['explanation', 'numericalCode', 'simulationCode']
};

export async function solveProblem(problemDescription: string): Promise<{ solution: Solution }> {
  const detailedPrompt = `
You are an expert in analytical mechanics and computational physics. Your task is to analyze a given physics problem and provide a detailed explanation, JavaScript code for numerical simulation, and JavaScript code for 2D animation.

**Problem:**
${problemDescription}

**Your response MUST be a JSON object conforming to the provided schema.**

**Detailed Instructions:**
1.  **\`explanation\`**: Provide a comprehensive, step-by-step physical and mathematical analysis. Start with the principles (e.g., Newton's laws, Lagrangian), derive the equations of motion, and explain the numerical method you will use. Use Markdown for structure and LaTeX (using '$' for inline and '$$' for block) for all mathematical expressions.
2.  **\`numericalCode\`**: Write the body of a single JavaScript function that performs the numerical integration.
    *   **High Accuracy**: You MUST implement the 4th-order Runge-Kutta (RK4) method or a similarly accurate integrator. Avoid simpler methods like Euler's method to ensure precision.
    *   **Sufficient Data**: Generate a high-resolution dataset with at least 200 points over a suitable time interval for smooth and accurate plotting.
    *   **Encapsulation**: All logic for the simulation (constants, initial conditions, differential equations, integration loop) must be self-contained within this function body. The body of code itself must end with \`return data_array;\`.
    *   **Data Structure**: Each element in the returned array MUST be an object. For 2D problems, use \`{ t: number, x: number, y: number, vx: number, vy: number }\`. For 3D problems, you MUST include the z-coordinate and its velocity: \`{ t: number, x: number, y: number, z: number, vx: number, vy: number, vz: number }\`.
3.  **\`simulationCode\`**: Write a JavaScript arrow function expression for rendering the 2D animation on an HTML canvas.
    *   **Signature**: The function expression must have the signature: \`(ctx, data, time, canvas) => { ... }\`.
    *   **Interpolation**: Find the object's state (position) at the current animation \`time\` by interpolating between points in the \`data\` array. Simple linear interpolation is sufficient.
    *   **Canvas Drawing**: Use the canvas API (\`ctx\`) to draw the scene. Clear the canvas (\`ctx.clearRect\`) at the start of each frame. Use \`canvas.width\` and \`canvas.height\` to scale the simulation and center the view appropriately. Make the visualization clear and physically representative. For 3D problems, project the motion onto the XY plane for this 2D visualization.

Analyze the problem carefully and generate the complete JSON object as requested. Do not include any text outside the JSON object.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: detailedPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: solutionSchema,
      },
    });

    const jsonText = response.text.trim();
    const solution: Solution = JSON.parse(jsonText);
    return { solution };
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message.includes('API key not valid')) {
         throw new Error("کلید API نامعتبر است. لطفاً تنظیمات محیطی خود را بررسی کنید.");
    }
    let message = "مدل هوش مصنوعی نتوانست پاسخ معتبری تولید کند.";
    if(error.message.includes('SAFETY')) {
        message = "پاسخ به دلیل تنظیمات ایمنی مسدود شد. لطفاً شرح مسئله دیگری را امتحان کنید."
    } else if (error.message.includes('JSON')) {
        message = "مدل هوش مصنوعی پاسخی را برگرداند که قابل تجزیه نبود. لطفاً دوباره تلاش کنید."
    }
    throw new Error(message);
  }
}