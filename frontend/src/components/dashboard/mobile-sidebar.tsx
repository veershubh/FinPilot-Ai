// src/components/dashboard/mobile-sidebar.tsx
// Slide‑over sidebar for mobile devices.

'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>
        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative w-64 max-w-xs bg-[#0B1020] shadow-xl">
              <button
                className="absolute top-4 right-4 text-[#94A3B8] hover:text-white"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
              <DashboardSidebar />
            </Dialog.Panel>
          </Transition.Child>
          <div className="flex w-0 flex-1" />
        </div>
      </Dialog>
    </Transition.Root>
  );
}
