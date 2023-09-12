import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, PropTypes, RequiredBy } from "@zag-js/types"

export interface LoadingChangeDetails {
  status: "loaded" | "error"
}

interface PublicContext extends CommonProperties {
  onLoadingStatusChange?: (details: LoadingChangeDetails) => void
}

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "loading" | "error" | "loaded"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the image is loaded.
   */
  isLoaded: boolean
  /**
   * Whether the fallback is shown.
   */
  showFallback: boolean
  /**
   * Function to set new src.
   */
  setSrc(src: string): void
  /**
   * Function to set loaded state.
   */
  setLoaded(): void
  /**
   * Function to set error state.
   */
  setError(): void

  rootProps: T["element"]
  imageProps: T["img"]
  fallbackProps: T["element"]
}
