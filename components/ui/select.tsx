'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>
) {
  return <SelectPrimitive.Group {...props} />;
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}) {
  const base =
    'flex w-fit items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ' +
    'focus:border-gray-300 focus:ring-2 focus:ring-green-400/50 ' +
    'data-[state=open]:border-gray-300 data-[state=open]:ring-2 data-[state=open]:ring-green-400/50 ' +
    'data-[size=default]:h-9 data-[size=sm]:h-8 ' +
    "[&_svg:not([class*='text-'])]:text-gray-600 [&_svg:not([class*='size-'])]:size-4";

  return (
    <SelectPrimitive.Trigger
      data-size={size}
      className={`${base} ${className || ''}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const base =
    'relative z-50 min-w-[8rem] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md ' +
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95';
  const pos =
    position === 'popper'
      ? ' data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
      : '';
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`${base}${pos} ${className || ''}`}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={
            'p-1 ' +
            (position === 'popper'
              ? 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
              : '')
          }
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel(
  props: React.ComponentProps<typeof SelectPrimitive.Label>
) {
  return (
    <SelectPrimitive.Label
      className={`px-2 py-1.5 text-xs text-gray-500 ${props.className || ''}`}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const base =
    'relative flex w-full select-none items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm outline-none ' +
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ' +
    'data-[highlighted]:bg-green-50 data-[highlighted]:text-gray-900 ' +
    'data-[state=checked]:bg-green-50 data-[state=checked]:text-green-800 ' +
    "[&_svg:not([class*='text-'])]:text-green-700 [&_svg:not([class*='size-'])]:size-4";
  return (
    <SelectPrimitive.Item className={`${base} ${className || ''}`} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator(
  props: React.ComponentProps<typeof SelectPrimitive.Separator>
) {
  return (
    <SelectPrimitive.Separator
      className={`-mx-1 my-1 h-px bg-gray-200 pointer-events-none ${
        props.className || ''
      }`}
      {...props}
    />
  );
}

function SelectScrollUpButton(
  props: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={`flex cursor-default items-center justify-center py-1 ${
        props.className || ''
      }`}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton(
  props: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={`flex cursor-default items-center justify-center py-1 ${
        props.className || ''
      }`}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
