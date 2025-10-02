import React, { useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { OutputTabs } from './components/OutputTabs';
import { solveProblem } from './services/geminiService';
import type { Solution, PlotDataPoint } from './types';
import { IconAtom } from './components/icons';

const App: React.FC = () => {
  const [problemDescription, setProblemDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [plotData, setPlotData] = useState<PlotDataPoint[] | null>(null);
  const [activeTab, setActiveTab] = useState('explanation');

  const executeNumericalCode = (code: string): PlotDataPoint[] => {
    try {
      // کد دریافت شده از Gemini باید بدنه یک تابع باشد که داده‌ها را محاسبه و برمی‌گرداند.
      const simulationFunction = new Function(code);
      const data = simulationFunction();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("کد عددی تولید شده یک آرایه داده معتبر را برنگرداند.");
      }
      // اعتبارسنجی اولین نقطه داده
      const firstPoint = data[0];
      if (typeof firstPoint.t !== 'number' || typeof firstPoint.x !== 'number' || typeof firstPoint.y !== 'number') {
        throw new Error("نقاط داده تولید شده ساختار نامعتبری دارند.");
      }

      return data;
    } catch (e: any) {
      console.error("Error executing numerical code:", e);
      throw new Error(`اجرای کد تحلیل عددی تولید شده با شکست مواجه شد. \nجزئیات: ${e.message}`);
    }
  };

  const handleSolve = async () => {
    setIsLoading(true);
    setError(null);
    setSolution(null);
    setPlotData(null);
    setActiveTab('explanation'); // با هر حل جدید به تب توضیحات برگرد

    try {
      const result = await solveProblem(problemDescription);
      setSolution(result.solution);

      if (result.solution.numericalCode) {
        const data = executeNumericalCode(result.solution.numericalCode);
        setPlotData(data);
      }
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'خطای ناشناخته‌ای در ارتباط با مدل هوش مصنوعی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetExample = (examplePrompt: string) => {
    setProblemDescription(examplePrompt);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4" dir="rtl">
      <header className="text-center mb-6">
          <div className="flex justify-center items-center gap-3">
              <IconAtom className="w-10 h-10 text-cyan-400"/>
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
                تحلیلگر هوشمند مکانیک تحلیلی
              </h1>
          </div>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            مسائل مکانیک را وارد کنید تا هوش مصنوعی آن را تحلیل، شبیه‌سازی و نمودارهای حرکت را برای شما رسم کند.
        </p>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-1">
          <InputPanel
            problemDescription={problemDescription}
            setProblemDescription={setProblemDescription}
            onSolve={handleSolve}
            isLoading={isLoading}
            onSetExample={handleSetExample}
          />
        </div>
        <div className="lg:col-span-1 min-h-[60vh] lg:min-h-0">
          <OutputTabs
            isLoading={isLoading}
            error={error}
            solution={solution}
            plotData={plotData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </main>
      <footer className="text-center text-gray-500 text-sm mt-6 pb-4">
        ساخته شده با قدرت Gemini API
      </footer>
    </div>
  );
};

export default App;
