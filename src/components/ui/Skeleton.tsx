import React from 'react';

interface SkeletonProps {
  /** Chiều cao của skeleton */
  height?: number | string;
  /** Chiều rộng của skeleton */
  width?: number | string;
  /** CSS class bổ sung */
  className?: string;
  /** Hình dạng của skeleton */
  variant?: 'rectangle' | 'circle' | 'text';
  /** Số lượng dòng skeleton nếu variant là text */
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height,
  width,
  className = '',
  variant = 'rectangle',
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  let styleProps: React.CSSProperties = { 
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
  };

  if (variant === 'circle') {
    return (
      <div 
        className={`${baseClasses} rounded-full ${className}`}
        style={{
          ...styleProps,
          width: height, // Make sure circle is actually a circle by setting width=height
        }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div className="flex flex-col space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={`${baseClasses} ${className}`}
            style={{
              ...styleProps,
              height: height || '1rem',
              width: i === lines - 1 && lines > 1 ? '80%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={styleProps}
    />
  );
}; 