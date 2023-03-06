export type FormAssociated = {
  disabled?: boolean;
  required?: boolean;

  name?: string;
  value?: string;

  // https://web.dev/more-capable-form-controls/#lifecycle-callbacks
  formAssociatedCallback?: (form: HTMLFormElement) => void;
  formDisabledCallback?: (disabled: boolean) => void;
  formResetCallback?: () => void;
  formStateRestoreCallback?: (
    state: string | File | FormData | null,
    mode: 'autocomplete' | 'restore',
  ) => void;

  checkValidity?: () => boolean;
  reportValidity?: () => boolean;
  validity?: () => ValidityState
};
