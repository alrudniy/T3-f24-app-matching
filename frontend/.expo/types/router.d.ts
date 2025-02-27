/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/register` | `/(home)` | `/(home)/` | `/(home)/accountCreation` | `/(home)/accountSelection` | `/(home)/voucher` | `/(login)` | `/(login)/(auth)` | `/(login)/(auth)/register` | `/(login)/forgot_password` | `/(login)/register` | `/(main)` | `/(main)/` | `/(main)/(home)` | `/(main)/(home)/` | `/(main)/(home)/accountCreation` | `/(main)/(home)/accountSelection` | `/(main)/(home)/voucher` | `/(main)/accountCreation` | `/(main)/accountSelection` | `/(main)/landlordMatchingHistory` | `/(main)/matching` | `/(main)/matchingHistory` | `/(main)/profile` | `/(main)/properties` | `/(main)/propertyCreation` | `/(main)/settings` | `/(main)/styles` | `/(main)/voucher` | `/_sitemap` | `/accountCreation` | `/accountSelection` | `/forgot_password` | `/landlordMatchingHistory` | `/matching` | `/matchingHistory` | `/profile` | `/properties` | `/propertyCreation` | `/register` | `/settings` | `/styles` | `/voucher`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
