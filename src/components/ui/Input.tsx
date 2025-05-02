import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full rounded-md border bg-white px-3 py-2 text-secondary-900 placeholder-secondary-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus-visible:ring-primary-500',
        error: 'border-error-300 focus-visible:ring-error-500 pr-10',
        success: 'border-success-300 focus-visible:ring-success-500 pr-10',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  success?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, ...props }, ref) => {
    // Automatically set variant based on error or success status
    const variantToUse = error ? 'error' : success ? 'success' : variant;
    
    return (
      <div className="relative">
        <input
          className={cn(inputVariants({ variant: variantToUse, size }), className)}
          ref={ref}
          {...props}
        />
        
        {/* Error icon */}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className="h-5 w-5 text-error-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        
        {/* Success icon */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className="h-5 w-5 text-success-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        
        {/* Error text */}
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
        
        {/* Success text */}
        {success && !error && (
          <p className="mt-1 text-sm text-success-600">{success}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 