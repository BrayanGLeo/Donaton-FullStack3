import React from 'react';
import { motion } from 'framer-motion';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-5 position-relative">
      <div 
        className="position-absolute bg-light" 
        style={{ top: '50%', left: '0', right: '0', height: '4px', transform: 'translateY(-50%)', zIndex: 0 }}
      >
        <motion.div 
          className="bg-primary h-100" 
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <div key={label} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 1 }}>
            <motion.div
              initial={false}
              animate={{
                backgroundColor: isActive || isCompleted ? 'var(--bs-primary)' : '#f8f9fa',
                color: isActive || isCompleted ? '#fff' : '#6c757d',
                borderColor: isActive || isCompleted ? 'var(--bs-primary)' : '#dee2e6'
              }}
              className="rounded-circle d-flex align-items-center justify-content-center border"
              style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
            >
              {isCompleted ? '✓' : stepNum}
            </motion.div>
            <div className={`mt-2 small fw-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
