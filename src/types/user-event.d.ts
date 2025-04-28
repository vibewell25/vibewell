declare module '@testing-library/user-event' {
  import { PointerOptions } from '@testing-library/dom';

  interface TypeOptions {
    skipClick?: boolean;
    skipAutoClose?: boolean;
    delay?: number;
  }

  interface UserEvent {
    clear(element: Element): Promise<void>;
    click(element: Element, options?: PointerOptions): Promise<void>;
    dblClick(element: Element, options?: PointerOptions): Promise<void>;
    type(element: Element, text: string, options?: TypeOptions): Promise<void>;
    upload(element: Element, file: File | File[]): Promise<void>;
    hover(element: Element): Promise<void>;
    unhover(element: Element): Promise<void>;
    paste(element: Element, text: string): Promise<void>;
    selectOptions(
      element: Element,
      values: string | string[] | HTMLElement | HTMLElement[],
    ): Promise<void>;
    deselectOptions(
      element: Element,
      values: string | string[] | HTMLElement | HTMLElement[],
    ): Promise<void>;
    tab({ shift }?: { shift?: boolean }): Promise<void>;
  }

  export default function userEvent(): UserEvent;
}
