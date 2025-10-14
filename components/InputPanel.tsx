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
        name: 'نوسانگر میرا',
        prompt: 'حرکت یک نوسانگر هارمونیک میرا با جرم ۰.۵ کیلوگرم، ثابت فنر ۵۰ نیوتن بر متر و ضریب میرایی ۲ نیوتن ثانیه بر متر را تحلیل کنید. جسم از موقعیت اولیه ۰.۱ متر با سرعت صفر رها می‌شود.'
    },
    {
        name: 'حرکت سیاره‌ای',
        prompt: 'حرکت یک سیاره به دور یک ستاره ثابت در مبدا را شبیه‌سازی کنید. نیروی گرانش را در نظر بگیرید. شرایط اولیه: سیاره در (1, 0) قرار دارد و سرعت اولیه آن (0, 5) است. جرم ستاره بسیار بزرگتر از سیاره است.'
    },
    {
        name: 'حرکت مارپیچ (۳ بعدی)',
        prompt: 'یک ذره با شرایط اولیه x=1, y=0, z=0 و سرعت اولیه vx=0, vy=2, vz=1 را در یک میدان مغناطیسی یکنواخت در راستای محور z تحلیل کنید. این حرکت باید یک مسیر مارپیچ باشد.'
    },
    {
        name: 'آونگ کروی (۳ بعدی)',
        prompt: 'یک آونگ کروی به طول ۱ متر را تحلیل کنید. در t=0، ذره در x=0.5 متر و y=0 متر قرار دارد و با سرعت اولیه ۲ متر بر ثانیه در جهت y حرکت می‌کند. مبدا را نقطه آویز در نظر بگیرید.'
    },
    {
        name: 'سقوط کوریولیس (۳ بعدی)',
        prompt: 'یک جسم را تحلیل کنید که از بالای یک برج به ارتفاع ۱۰۰ متر در استوا رها می‌شود. انحراف شرقی ناشی از نیروی کوریولیس را محاسبه و شبیه‌سازی کنید.'
    },
    {
        name: 'آونگ دوتایی (آشوبناک)',
        prompt: 'حرکت یک آونگ دوتایی را تحلیل کنید. هر دو میله به طول ۱ متر و هر دو وزنه به جرم ۱ کیلوگرم هستند. آونگ از حالت سکون رها می‌شود، در حالی که آونگ بالایی زاویه ۹۰ درجه و آونگ پایینی زاویه صفر درجه با محور عمودی می‌سازد.'
    },
    {
        name: 'ذره در میدان E&B (۳ بعدی)',
        prompt: 'حرکت یک ذره با بار ۱ و جرم ۱ را تحلیل کنید که از مبدا با سرعت اولیه (vx=0, vy=1, vz=1) در یک میدان مغناطیسی یکنواخت B=2 (در جهت z) و میدان الکتریکی E=0.5 (در جهت x) حرکت می‌کند.'
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
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
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