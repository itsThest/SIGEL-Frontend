import React from 'react';

const LoadingSkeleton = ({ count = 1, type = 'card' }) => {
  const Skeletons = Array(count).fill(0).map((_, i) => i);

  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Skeletons.map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default 'card' type
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Skeletons.map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden">
          <div className="h-32 w-full bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
          <div className="flex justify-between mt-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
