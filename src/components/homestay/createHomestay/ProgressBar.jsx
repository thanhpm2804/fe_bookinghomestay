import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className={styles.progressBarWrapper}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div 
              key={step.id} 
              className={`${styles.progressStep} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center
                  ${styles.progressIcon}
                  ${isActive ? styles.active : ''}
                  ${isCompleted ? styles.completed : ''}
                `}
              >
                <i className={`bi ${step.icon}`}></i>
              </div>
              <div className={styles.progressLabel}>
                {step.title}
              </div>
              {idx < steps.length - 1 && (
                <div className={`${styles.progressLine} ${isCompleted ? styles.completed : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="progress" style={{ height: '6px' }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          aria-valuenow={currentStep}
          aria-valuemin="1"
          aria-valuemax={steps.length}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar; 