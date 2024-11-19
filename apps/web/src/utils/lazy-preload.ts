/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, createElement, forwardRef, lazy, useRef } from "react";

export type PreloadableComponent<T extends ComponentType<any>> = T & {
  preload: () => Promise<T>;
};

export function lazyPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  const ReactLazyComponent = lazy(factory);
  let PreloadedComponent: T | undefined;
  let factoryPromise: Promise<T> | undefined;

  const Component = forwardRef(function LazyPreload(props, ref) {
    // Once one of these is chosen, we must ensure that it continues to be
    // used for all subsequent renders, otherwise it can cause the
    // underlying component to be unmounted and remounted.
    const ComponentToRender = useRef(PreloadedComponent ?? ReactLazyComponent);
    return createElement(
      ComponentToRender.current,
      Object.assign(ref ? { ref } : {}, props) as any,
    );
  });

  const LazyPreload = Component as any as PreloadableComponent<T>;

  LazyPreload.preload = () => {
    if (!factoryPromise) {
      factoryPromise = factory().then((module) => {
        PreloadedComponent = module.default;
        return PreloadedComponent;
      });
    }

    return factoryPromise;
  };

  return LazyPreload;
}

export default lazyPreload;
