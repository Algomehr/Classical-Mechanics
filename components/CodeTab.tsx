import React, { useState, useEffect } from 'react';
import { IconPlay, IconRefreshCw } from './icons';

interface CodeTabProps {
  numericalCode: string;
  simulationCode: string;
  simulationCode3D?: string;
  onUpdate: (codes: { numericalCode: string; simulationCode: string; simulationCode3D?: string }) => void;
  isLoading: boolean;
}

const CodeEditor: React.FC<{ title: string; value: string; onChange: (value: string) => void; disabled: boolean }> = ({ title, value, onChange, disabled }) => (
    <div>
        <h3 className="text-lg font-semibold text-cyan-300 mb-2">{title}</h3>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-48 bg-gray-900/70 border border-gray-600 rounded-md p-3 font-mono text-sm text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-y"
            spellCheck="false"
        />
    </div>
);

export const CodeTab: React.FC<CodeTabProps> = ({ numericalCode, simulationCode, simulationCode3D, onUpdate, isLoading }) => {
    const [numCode, setNumCode] = useState(numericalCode);
    const [simCode, setSimCode] = useState(simulationCode);
    const [simCode3D, setSimCode3D] = useState(simulationCode3D);

    useEffect(() => {
        setNumCode(numericalCode);
        setSimCode(simulationCode);
        setSimCode3D(simulationCode3D);
    }, [numericalCode, simulationCode, simulationCode3D]);

    const handleUpdate = () => {
        onUpdate({ numericalCode: numCode, simulationCode: simCode, simulationCode3D: simCode3D });
    };

    const handleReset = () => {
        setNumCode(numericalCode);
        setSimCode(simulationCode);
        setSimCode3D(simulationCode3D);
    };

    const hasChanges = numCode !== numericalCode || simCode !== simulationCode || simCode3D !== simulationCode3D;

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            <CodeEditor title="کد تحلیل عددی" value={numCode} onChange={setNumCode} disabled={isLoading} />
            <CodeEditor title="کد شبیه‌سازی بصری ۲ بعدی" value={simCode} onChange={setSimCode} disabled={isLoading} />
            {simulationCode3D !== undefined && (
                <CodeEditor title="کد شبیه‌سازی بصری ۳ بعدی" value={simCode3D || ''} onChange={setSimCode3D} disabled={isLoading} />
            )}
            <div className="flex items-center gap-4 pt-2">
                <button
                    onClick={handleUpdate}
                    disabled={isLoading || !hasChanges}
                    className="flex-1 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-cyan-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <IconPlay className="w-5 h-5 ml-2" />
                    <span>اجرای کد اصلاح شده</span>
                </button>
                <button
                    onClick={handleReset}
                    disabled={isLoading || !hasChanges}
                    className="bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50"
                    title="بازنشانی به کد اصلی"
                >
                    <IconRefreshCw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};