import { Description, Dialog, DialogPanel, DialogTitle, DialogBackdrop, CloseButton } from '@headlessui/react';
import { useState } from 'react';
import { Alert } from './Alert';
import VanillaCalendar from './VanillaCalendar';

const content = {
  title: 'When would you like your next order?',
  notice: 'Schedule changes will apply to all future orders.',
  description: 'Please select a new date and time for your appointment.',
  cancelButton: 'Cancel',
  rescheduleButton: 'Save changes',
};

export function RescheduleModal() {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Reschedule</button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 ">
        <DialogBackdrop transition className="affinity-modal-overlay fixed inset-0 bg-black/30" />

        <div className="recharge-theme fixed inset-0 flex w-screen items-end lg:items-center justify-center p-">
          <DialogPanel
            transition
            className="affinity-modal-panel max-w-lg space-y-4 bg-white p-12 transition-all duration-300 data-[closed]:opacity-0 data-[closed]:translate-y-5"
          >
            <div className="flex justify-end mb-0 sticky">
              <CloseButton className="affinity-modal-close">
                <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                  <path
                    d="m1 1 12 12M1 13 13 1"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </CloseButton>
            </div>
            <div className="mt-[-32px]">
              <DialogTitle className="font-bold mt-0">{content.title}</DialogTitle>
              <Alert />
              <Description>{content.description}</Description>
              <VanillaCalendar />
              <div className="flex gap-4">
                <button onClick={() => setIsOpen(false)}>{content.rescheduleButton}</button>
                <button onClick={() => setIsOpen(false)}>{content.cancelButton}</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
