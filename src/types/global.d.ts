import { ReactElement, ReactNode } from 'react'
declare global {
  namespace JSX {
    interface Element extends ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
export {}