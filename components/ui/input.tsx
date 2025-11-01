import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
      {...props}
    />
  );
}

export { Input };
