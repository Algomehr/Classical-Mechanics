
import React from 'react';
import { IconDocument, IconSparkles, IconPlay } from './icons';

interface InputPanelProps {
  problemDescription: string;
  setProblemDescription: (value: string) => void;
  onSolve: () => void;
  isLoading: boolean;
  onSetExample: (example: string) => void;
}

const examples = [
    {
        name: 'پرتابه',
        prompt: 'حرکت یک پرتابه را که از مبدا با سرعت اولیه ۱۰ متر بر ثانیه و زاویه پرتاب ۴۵ درجه پرتاب می‌شود، تحلیل کنید. مقاومت هوا را نادیده بگیرید.'
    },
    {
        name: 'آونگ ساده',
        prompt: 'نوسانات یک آونگ ساده به طول ۱ متر و جرم ۰.۵ کیلوگرم را تحلیل کنید که از زاویه اولیه ۱۵ درجه رها می‌شود. از تقریب زاویه کوچک استفاده نکنید.'
    },
    {
        name: 'حرکت سیاره‌ای',
        prompt: 'حرکت یک سیاره به دور یک ستاره ثابت در مبدا را شبیه‌سازی کنید. نیروی گرانش را در نظر بگیرید. شرایط اولیه: سیاره در (1, 0) قرار دارد و سرعت اولیه آن (0, 5) است. جرم ستاره بسیار بزرگتر از سیاره است.'
    },
    {
        name: 'حرکت مارپیچ',
        prompt: 'یک ذره با شرایط اولیه x=1, y=0, z=0 و سرعت اولیه vx=0, vy=2, vz=1 را در یک میدان مغناطیسی یکنواخت در راستای محور z تحلیل کنید. این حرکت باید یک مسیر مارپیچ باشد.'
    }
]

export const InputPanel: React.FC<InputPanelProps> = ({
  problemDescription,
  setProblemDescription,
  onSolve,
  isLoading,
  onSetExample,
}) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col shadow-lg">
      <div className="flex items-center mb-3 text-lg font-semibold text-cyan-300">
        <IconDocument className="w-6 h-6 ml-2" />
        <span>شرح مسئله</span>
      </div>
      <textarea
        className="w-full flex-grow bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
        rows={10}
        placeholder="مثال: حرکت یک پرتابه با سرعت اولیه ۱۰ متر بر ثانیه و زاویه ۴۵ درجه را تحلیل کنید..."
        value={problemDescription}
        onChange={(e) => setProblemDescription(e.target.value)}
        disabled={isLoading}
      />
      <div className='mt-4'>
        <p className='text-sm text-gray-400 mb-2'>یا یک مثال را امتحان کنید:</p>
        <div className='flex flex-wrap gap-2'>
            {examples.map(ex => (
                 <button 
                    key={ex.name}
                    onClick={() => onSetExample(ex.prompt)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    {ex.name}
                 </button>
            ))}
        </div>
      </div>
      <button
        onClick={onSolve}
        disabled={isLoading || !problemDescription}
        className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-cyan-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed shadow-cyan-500/20 shadow-lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>در حال پردازش...</span>
          </>
        ) : (
          <>
            <IconSparkles className="w-5 h-5 mr-2" />
            <span>حل و تحلیل کن</span>
          </>
        )}
      </button>
    </div>
  );
};