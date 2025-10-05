import React, { useMemo } from 'react';
import type { Solution, PlotDataPoint } from '../types';
import { GraphsTab } from './GraphsTab';
import { SimulationTab } from './SimulationTab';
import { IconAtom, IconChart, IconInfo, Icon3D, IconSliders, IconCode, IconPlay } from './icons';
import { Marked } from 'marked';
import katex from 'katex';
import { Plot3DTab } from './Plot3DTab';
import { ParametersTab } from './ParametersTab';
import { CodeTab } from './CodeTab';

interface OutputTabsProps {
  isLoading: boolean;
  error: string | null;
  solution: Solution | null;
  plotData: PlotDataPoint[] | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  interactiveParams: Record<string, number> | null;
  onParamChange: (name: string, value: number) => void;
  onCodeUpdate: (codes: { numericalCode: string; simulationCode: string }) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; }> = ({ active, onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
      active
        ? 'border-b-2 border-cyan-400 text-cyan-300'
        : 'text-gray-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export const OutputTabs: React.FC<OutputTabsProps> = ({
  isLoading,
  error,
  solution,
  plotData,
  activeTab,
  setActiveTab,
  interactiveParams,
  onParamChange,
  onCodeUpdate
}) => {
  const has3DData = useMemo(() => plotData?.some(p => p.z !== undefined), [plotData]);
  const hasParameters = useMemo(() => solution?.parameters && solution.parameters.length > 0, [solution]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-semibold text-white">در حال تحلیل مسئله...</h3>
            <p className="text-gray-400 mt-2">هوش مصنوعی در حال محاسبه و آماده‌سازی نتایج است. لطفاً کمی صبر کنید.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 border border-red-500/50 rounded-lg p-8">
            <IconInfo className="w-12 h-12 text-red-400 mb-4"/>
            <h3 className="text-xl font-semibold text-red-300">خطا رخ داد</h3>
            <p className="text-red-300/80 mt-2 whitespace-pre-wrap">{error}</p>
        </div>
      );
    }

    if (!solution) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <IconAtom className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">آماده برای تحلیل</h3>
                <p className="text-gray-500 mt-2">یک مسئله را در پنل سمت راست وارد کنید و دکمه "حل و تحلیل کن" را بزنید.</p>
            </div>
        );
    }
    
    return (
        <div className='p-1 sm:p-2 md:p-4 h-full'>
            {activeTab === 'explanation' && <ExplanationTab explanation={solution.explanation} />}
            {activeTab === 'graphs' && <GraphsTab plotData={plotData} />}
            {activeTab === 'simulation' && <SimulationTab simulationCode={solution.simulationCode} plotData={plotData} />}
            {activeTab === 'plot3d' && has3DData && <Plot3DTab plotData={plotData} />}
            {activeTab === 'parameters' && hasParameters && interactiveParams && <ParametersTab parameters={solution.parameters} paramValues={interactiveParams} onParamChange={onParamChange} />}
            {activeTab === 'code' && <CodeTab numericalCode={solution.numericalCode} simulationCode={solution.simulationCode} onUpdate={onCodeUpdate} isLoading={isLoading} />}
        </div>
    );
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col h-full shadow-lg">
      {solution && (
          <div className="border-b border-gray-700 px-4">
            <nav className="-mb-px flex space-x-4 space-x-reverse" aria-label="Tabs">
              <TabButton active={activeTab === 'explanation'} onClick={() => setActiveTab('explanation')}>
                <IconInfo className="w-5 h-5 ml-2" />
                توضیحات و تحلیل
              </TabButton>
              <TabButton active={activeTab === 'graphs'} onClick={() => setActiveTab('graphs')}>
                 <IconChart className="w-5 h-5 ml-2" />
                نمودارها
              </TabButton>
              {hasParameters && (
                <TabButton active={activeTab === 'parameters'} onClick={() => setActiveTab('parameters')}>
                  <IconSliders className="w-5 h-5 ml-2" />
                  پارامترها
                </TabButton>
              )}
              {has3DData && (
                <TabButton active={activeTab === 'plot3d'} onClick={() => setActiveTab('plot3d')}>
                  <Icon3D className="w-5 h-5 ml-2" />
                  نمودار سه بعدی
                </TabButton>
              )}
              <TabButton active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')}>
                <IconPlay className="w-5 h-5 ml-2" />
                شبیه‌سازی
              </TabButton>
               <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
                  <IconCode className="w-5 h-5 ml-2" />
                  کد
              </TabButton>
            </nav>
          </div>
        )}
      <div className="flex-grow min-h-0">
         {renderContent()}
      </div>
    </div>
  );
};

const ExplanationTab: React.FC<{ explanation: string }> = ({ explanation }) => {
    const parsedHtml = useMemo(() => {
        if (!explanation) return '';

        const marked = new Marked();

        const blockKatex = {
            name: 'blockKatex',
            level: 'block' as const,
            start(src: string) { return src.indexOf('\n$$'); },
            tokenizer(src: string) {
                const match = src.match(/^\$\$([\s\S]+?)\$\$/);
                if (match) {
                    return {
                        type: 'blockKatex',
                        raw: match[0],
                        text: match[1].trim(),
                    };
                }
            },
            renderer(token: any) {
                try {
                    return `<p>${katex.renderToString(token.text, { displayMode: true, throwOnError: false, output: 'html' })}</p>`;
                } catch (e: any) {
                    return `<p class="text-red-400">Error rendering LaTeX: ${e.message}</p>`;
                }
            },
        };

        const inlineKatex = {
            name: 'inlineKatex',
            level: 'inline' as const,
            start(src: string) { return src.indexOf('$'); },
            tokenizer(src:string) {
                const match = src.match(/^\$((?:\\\$|[^$])+?)\$/);
                if (match) {
                    return {
                        type: 'inlineKatex',
                        raw: match[0],
                        text: match[1].trim(),
                    };
                }
            },
            renderer(token: any) {
                try {
                    const html = katex.renderToString(token.text, { displayMode: false, throwOnError: false, output: 'html' });
                    // Wrap in a span with dir="ltr" to fix directionality issues when mixed with RTL text,
                    // and use inline-block for better layout treatment.
                    return `<span class="inline-block align-middle" dir="ltr">${html}</span>`;
                } catch (e: any) {
                    return `<span class="text-red-400">Error rendering LaTeX: ${e.message}</span>`;
                }
            },
        };

        marked.use({ extensions: [blockKatex, inlineKatex], gfm: true, breaks: true });
        
        // Replace escaped characters from JSON string for correct rendering
        const processedExplanation = explanation
            .replace(/\\n/g, '\n')
            .replace(/\\\$/g, '$');
            
        return marked.parse(processedExplanation) as string;

    }, [explanation]);

    return (
        <div className="prose prose-invert max-w-none h-full overflow-y-auto p-4 
                       [&_p]:text-gray-300 [&_p]:mb-4
                       [&_h1]:text-cyan-200 [&_h2]:text-cyan-300 [&_h3]:text-cyan-400
                       [&_code]:bg-gray-700 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-1 [&_code]:text-yellow-300
                       [&_pre]:bg-gray-900/70 [&_pre]:p-4 [&_pre]:rounded-md
                       [&_blockquote]:border-r-4 [&_blockquote]:border-cyan-500 [&_blockquote]:pr-4 [&_blockquote]:italic
                       [&_ul]:list-disc [&_ul]:pr-6 [&_li]:mb-2
                       [&_a]:text-teal-400 hover:[&_a]:underline">
            <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
        </div>
    );
};