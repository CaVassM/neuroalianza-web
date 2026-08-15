import React from 'react';
import { motion } from 'motion/react';

interface StepProgressProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onStepClick,
  className = '',
}) => {
  const steps = [
    { number: 1 as const, label: 'Tu hijo/a' },
    { number: 2 as const, label: 'Ubicación' },
    { number: 3 as const, label: 'Seguro' },
  ];

  // Calculate percentage of line progress
  const getProgressPercentage = () => {
    if (currentStep === 1) return '0%';
    if (currentStep === 2) return '50%';
    return '100%';
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto mb-10 mt-1 px-3 select-none ${className}`}>
      <div className="relative flex justify-between items-center h-10">
        {/* Continuous background connecting line spanning center of Step 1 to Step 3 */}
        <div className="absolute top-5 left-5 right-5 h-[3.5px] bg-[#E5E1EC] rounded-full -translate-y-1/2 z-0 overflow-hidden">
          {/* Animated active purple progress bar */}
          <motion.div
            className="h-full bg-[#4A2270] rounded-full"
            initial={{ width: getProgressPercentage() }}
            animate={{ width: getProgressPercentage() }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = Boolean(onStepClick && isCompleted);

          return (
            <div
              key={step.number}
              onClick={() => isClickable && onStepClick && onStepClick(step.number)}
              className={`relative z-10 flex flex-col items-center group ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Step Circle Node */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#4A2270] border-2 border-[#4A2270] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[#FAF8FD] border-[3px] border-[#4A2270] text-[#4A2270] shadow-sm ring-4 ring-[#4A2270]/15'
                    : 'bg-white border-2 border-[#E5E1EC] text-[#8A8594]'
                } ${isClickable ? 'hover:ring-2 hover:ring-[#4A2270]/30 hover:scale-105' : ''}`}
              >
                {/* Step Number is ALWAYS clearly visible */}
                <span>{step.number}</span>
              </motion.div>

              {/* Step Label below circle */}
              <div className="absolute top-[46px] w-28 text-center pointer-events-none">
                <span
                  className={`text-[13px] tracking-tight block whitespace-nowrap transition-colors duration-200 ${
                    isCurrent
                      ? 'text-[#4A2270] font-bold'
                      : isCompleted
                      ? 'text-[#2E2A33] font-semibold'
                      : 'text-[#8A8594] font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
