/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 */
type ZoneFlagsWindow = Window & {
  __Zone_disable_customElements?: boolean;
};

(window as ZoneFlagsWindow).__Zone_disable_customElements = true;
