
import React, { useState, useEffect, useCallback } from 'react';
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
  const [interactiveParams, setInteractiveParams] = useState<Record<string, number> | null>(null);

  const executeNumericalCode = useCallback((code: string, params: Record<string, number> | null): PlotDataPoint[] => {
    try {
      let simulationFunction;
      let data;
      
      if (params && Object.keys(params).length > 0) {
        const paramNames = Object.keys(params);
        const paramValues = Object.values(params);
        simulationFunction = new Function(...paramNames, code);
        data = simulationFunction(...paramValues);
      } else {
        simulationFunction = new Function(code);
        data = simulationFunction();
      }
      
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
  }, []);

  const handleSolve = async () => {
    setIsLoading(true);
    setError(null);
    setSolution(null);
    setPlotData(null);
    setInteractiveParams(null);
    setActiveTab('explanation'); // با هر حل جدید به تب توضیحات برگرد

    try {
      const result = await solveProblem(problemDescription);
      setSolution(result.solution);

      if (result.solution.numericalCode) {
         const initialParams = result.solution.parameters?.reduce((acc, p) => {
            acc[p.name] = p.value;
            return acc;
        }, {} as Record<string, number>) || null;
        
        setInteractiveParams(initialParams);
        
        const data = executeNumericalCode(result.solution.numericalCode, initialParams);
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
  
  const handleParamChange = (name: string, value: number) => {
    setInteractiveParams(prev => (prev ? { ...prev, [name]: value } : null));
  };
  
  const handleCodeUpdate = useCallback((codes: { numericalCode: string; simulationCode: string; simulationCode3D?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const data = executeNumericalCode(codes.numericalCode, interactiveParams);
        setPlotData(data);
        setSolution(prev => (prev ? { ...prev, numericalCode: codes.numericalCode, simulationCode: codes.simulationCode, simulationCode3D: codes.simulationCode3D } : null));
        // برای مشاهده نتیجه بلافاصله به تب مناسب برو
        setActiveTab(codes.simulationCode3D ? 'simulation3d' : 'simulation');
    } catch (e: any) {
        setError(`خطا در اجرای کد اصلاح شده: ${e.message}`);
        // برای اصلاح خطا به تب کد برگرد
        setActiveTab('code');
    } finally {
        setIsLoading(false);
    }
  }, [executeNumericalCode, interactiveParams]);

  useEffect(() => {
    if (solution?.numericalCode && interactiveParams) {
        try {
            setError(null);
            const data = executeNumericalCode(solution.numericalCode, interactiveParams);
            setPlotData(data);
        } catch (e: any) {
            setError(`خطا در باز-محاسبه شبیه‌سازی: ${e.message}`);
        }
    }
  }, [interactiveParams, solution?.numericalCode, executeNumericalCode]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4" dir="rtl">
      <header className="text-center mb-6">
          <div className="flex justify-center items-center gap-3">
              <IconAtom className="w-10 h-10 text-cyan-400"/>
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
                تحلیلگر هوشمند سیستم‌های فیزیکی
              </h1>
          </div>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            مسائل فیزیک و مهندسی (مکانیک، مدارهای الکتریکی و ...) را وارد کنید تا هوش مصنوعی آن را تحلیل، شبیه‌سازی و نمودارها را برای شما رسم کند.
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
            interactiveParams={interactiveParams}
            onParamChange={handleParamChange}
            onCodeUpdate={handleCodeUpdate}
          />
        </div>
      </main>
      <footer className="text-center text-gray-500 text-sm mt-6 pb-4">
        توسعه یافته توسط <a href="https://mehrdad.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">مهرداد رجبی</a> | ساخته شده با قدرت Gemini API
      </footer>
    </div>
  );
};

export default App;
