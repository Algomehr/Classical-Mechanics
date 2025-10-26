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
      description: "توضیح کامل و گام‌به‌گام فیزیک مسئله. **الزامی است** که تمام فرمول‌ها، متغیرها و عبارات ریاضی با استفاده از LaTeX (با استفاده از `$` برای درون‌خطی و `$$` برای بلوک) نوشته شوند. پاسخ باید شامل تحلیل فیزیکی، استخراج معادلات حرکت و شرح روش عددی باشد."
    },
    numericalCode: {
      type: Type.STRING,
      description: "بدنه یک تابع جاوااسکریپت که پارامترهای تعاملی را به عنوان آرگومان دریافت کرده و انتگرال‌گیری عددی (مانند RK4) را انجام داده و آرایه‌ای از نقاط داده مانند {t, x, y, vx, vy, ...} را برمی‌گرداند. باید حداقل ۲۰۰ نقطه برای رسم نمودار تولید شود. خط آخر باید `return data_array;` باشد."
    },
    simulationCode: {
      type: Type.STRING,
      description: "یک عبارت تابع ارو فانکشن (arrow function) جاوااسکریپت برای رندر انیمیشن دو بعدی روی بوم (canvas). امضای تابع باید به شکل `(ctx, data, time, canvas) => { ... }` باشد."
    },
    simulationCode3D: {
      type: Type.STRING,
      description: "OPTIONAL. For 3D problems ONLY. A JavaScript arrow function for rendering a 3D animation using three.js. Signature MUST be `(scene, data, time, three) => { ... }`. This code adds/updates objects in the provided `scene` and `three` library instance."
    },
    parameters: {
      type: Type.ARRAY,
      description: "آرایه‌ای از پارامترهای فیزیکی کلیدی که کاربر می‌تواند به صورت تعاملی تغییر دهد.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "نام متغیر در کد (مثلاً `v0`)." },
          label: { type: Type.STRING, description: "برچسب نمایشی برای کاربر (مثلاً `سرعت اولیه`)." },
          value: { type: Type.NUMBER, description: "مقدار اولیه پارامتر از متن مسئله." },
          min: { type: Type.NUMBER, description: "حداقل مقدار منطقی برای اسلایدر." },
          max: { type: Type.NUMBER, description: "حداکثر مقدار منطقی برای اسلایدر." },
          step: { type: Type.NUMBER, description: "گام تغییرات اسلایدر." }
        },
        required: ['name', 'label', 'value', 'min', 'max', 'step']
      }
    }
  },
  required: ['explanation', 'numericalCode', 'simulationCode', 'parameters']
};

export async function solveProblem(problemDescription: string): Promise<{ solution: Solution }> {
  const detailedPrompt = `
You are an expert in analytical mechanics and computational physics. Your task is to analyze a given physics problem and provide a detailed explanation, JavaScript code for numerical simulation, JavaScript code for 2D animation, and a list of interactive parameters.

**Problem:**
${problemDescription}

**Your response MUST be a JSON object conforming to the provided schema.**

**Detailed Instructions:**
1.  **\`explanation\`**: Provide a comprehensive, step-by-step physical and mathematical analysis. Start with the principles (e.g., Newton's laws, Lagrangian), derive the equations of motion, and explain the numerical method you will use. **It is MANDATORY to use LaTeX for ALL mathematical formulas, variables, and expressions.** Use '$' for inline math (e.g., $v_0$) and '$$' for block equations (e.g., $$x(t) = x_0 + v_0 t + \\frac{1}{2} a t^2$$). Use Markdown for structure.
2.  **\`parameters\`**: Identify key physical parameters from the problem description that would be interesting for a user to vary interactively (e.g., initial velocity, mass, gravity, angle). For each parameter, define its variable name (\`name\`), a user-friendly \`label\`, its initial \`value\`, and a sensible range (\`min\`, \`max\`) and \`step\` for a slider. The range should typically be around ±50% of the initial value.
3.  **\`numericalCode\`**: Write the body of a single JavaScript function.
    *   **Function Signature**: This function body will receive the parameters defined in the \`parameters\` list as arguments. For example, if you define parameters with names "v0" and "angle", the code should be written as if it's the body of a function like \`function(v0, angle) { ... }\`. Do NOT declare the function itself.
    *   **High Accuracy**: You MUST implement the 4th-order Runge-Kutta (RK4) method or a similarly accurate integrator. Avoid simpler methods like Euler's method to ensure precision.
    *   **Sufficient Data**: Generate a high-resolution dataset with at least 200 points over a suitable time interval for smooth and accurate plotting.
    *   **Encapsulation**: All logic for the simulation must be self-contained. The body of code itself must end with \`return data_array;\`.
    *   **Data Structure**: Each element in the returned array MUST be an object. For 2D problems, use \`{ t: number, x: number, y: number, vx: number, vy: number }\`. For 3D problems, you MUST include the z-coordinate and its velocity: \`{ t: number, x: number, y: number, z: number, vx: number, vy: number, vz: number }\`. You should also calculate and include other relevant physical quantities like total energy ('energy'), and momentum components ('px', 'py', 'pz') where applicable.
4.  **\`simulationCode\`**: Write a JavaScript arrow function expression for rendering the 2D animation on an HTML canvas.
    *   **Signature**: The function expression must have the signature: \`(ctx, data, time, canvas) => { ... }\`.
    *   **Interpolation**: Find the object's state (position) at the current animation \`time\` by interpolating between points in the \`data\` array. Simple linear interpolation is sufficient.
    *   **Canvas Drawing**: Use the canvas API (\`ctx\`) to draw the scene. Clear the canvas (\`ctx.clearRect\`) at the start of each frame. Use \`canvas.width\` and \`canvas.height\` to scale the simulation and center the view appropriately. Make the visualization clear and physically representative. For 3D problems, project the motion onto the XY plane for this 2D visualization.
    *   **Specific Visualization Guidelines**:
        *   **Projectiles**: Draw the trajectory path up to the current time.
        *   **Oscillators (pendulums, springs)**: Draw the physical components. For a spring-mass system, which is typically 1D motion, draw a rectangle for the mass and a dynamic zigzag line for the spring connected to a fixed wall. For a pendulum, draw the pivot point, the rod/string, and the bob.
        *   **Forced Oscillator**: This is a critical case. In addition to the spring and mass, you **must** visually represent the external driving force. A good way is to draw an arrow attached to the mass. The arrow's length and direction should correspond to the instantaneous magnitude and direction of the driving force F(t) at the current animation \`time\`. You will need to re-calculate F(t) inside the animation function based on the parameters of the force given in the problem description.
5.  **\`simulationCode3D\`** (Optional): ONLY for problems with clear 3D motion (e.g., helical motion, orbits not in the XY plane), write a JavaScript arrow function for rendering with three.js. If the motion is 2D, DO NOT provide this field.
    *   **Signature**: The function must have the exact signature: \`(scene, data, time, three) => { ... }\`.
    *   **State Management**: Your code will be called on every animation frame. It must handle the creation and updating of 3D objects. A good pattern is to check if an object (e.g., \`scene.getObjectByName('particle')\`) exists. If not, create and add it to the scene. On every frame, update its position. You can also draw a trail.
    *   **Interpolation**: Use the same time interpolation technique as the 2D simulation to find the particle's current \`{x, y, z}\` state from the \`data\` array.
    *   **Dependencies**: Assume \`three\` is the \`THREE\` library object, passed as an argument.
    *   **Scope**: Do NOT create a camera, renderer, or animation loop. This is handled by the host application. Only provide the function body that manipulates objects within the given \`scene\`.

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