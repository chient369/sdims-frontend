import React from 'react';
import { cn } from '../../utils/cn';

// Heading component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, children, ...props }, ref) => {
    const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    return (
      <Component
        ref={ref}
        className={cn(
          level === 1 && 'text-3xl font-bold',
          level === 2 && 'text-2xl font-bold',
          level === 3 && 'text-xl font-bold',
          level === 4 && 'text-lg font-medium',
          level === 5 && 'text-base font-medium',
          level === 6 && 'text-sm font-medium',
          'text-secondary-900',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

// Text component
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'subtle' | 'primary';
  as?: 'p' | 'span' | 'div';
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size = 'base', variant = 'default', as: Component = 'p', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          // Size
          size === 'xs' && 'text-xs',
          size === 'sm' && 'text-sm',
          size === 'base' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl',
          
          // Variant
          variant === 'default' && 'text-secondary-700',
          variant === 'muted' && 'text-secondary-500',
          variant === 'subtle' && 'text-secondary-400',
          variant === 'primary' && 'text-primary-600',
          
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';

export { Heading, Text }; 