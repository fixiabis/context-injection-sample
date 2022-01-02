import React from 'react';
import { combineRefProps, extendComponent } from '../component';
import {
  ConvertToFeatures,
  DependencyParamsType,
  DependencyType,
  FeatureSource,
  FindPossibleDependencyKeys,
  UnknownFeatureParams,
} from './type';
import createFeaturesContextHook from './createFeaturesContextHook';

export interface FeaturesContextApplyOptions {
  isRefNeeded?: boolean;
  isComponent?: boolean;
}

function useDependencySolver<TFeatureParams extends UnknownFeatureParams>(
  features: ConvertToFeatures<TFeatureParams>,
  props: any,
  ref?: React.Ref<any>
) {
  const useDependencySolver = (dependencyKey: keyof TFeatureParams) => {
    if (features.__loadedDependencies && dependencyKey in features.__loadedDependencies) {
      return features.__loadedDependencies![dependencyKey];
    }

    const useDependency = features[dependencyKey];
    const dependency = useDependency(props, ref, features);

    if (features.__loadedDependencies) {
      features.__loadedDependencies[dependencyKey] = dependency;
    }

    return dependency;
  };

  return useDependencySolver;
}

function createFeaturesContextApplier<TFeatureParams extends UnknownFeatureParams>(
  FeaturesContext:
    | React.Context<ConvertToFeatures<TFeatureParams>>
    | (() => React.Context<ConvertToFeatures<TFeatureParams>>)
) {
  const useFeaturesContext = createFeaturesContextHook(FeaturesContext);

  function applyFeaturesContext<TFeatureSource extends FeatureSource>(
    useFeature: TFeatureSource,
    dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, DependencyParamsType<TFeatureSource>>,
    options: FeaturesContextApplyOptions = {}
  ) {
    if (options.isComponent || typeof useFeature !== 'function') {
      const FeatureComponent: any = useFeature;
      const renderFeatureComponent = (props: any) => React.createElement(FeatureComponent, props);
      useFeature = renderFeatureComponent as TFeatureSource;

      extendComponent(useFeature, FeatureComponent);
    }

    function useAppliedFeature(
      props: any,
      ref?: React.Ref<any>,
      features?: ConvertToFeatures<TFeatureParams>
    ): DependencyType<TFeatureSource> {
      features = features?.__isFeaturesRoot ? features : useFeaturesContext(props, ref);
      const dependencies = dependencyKeys.map(useDependencySolver(features, props, ref));
      return (useFeature as (...args: any[]) => any)(...dependencies);
    }

    extendComponent(useAppliedFeature as React.ElementType, useFeature);

    if (options.isRefNeeded) {
      return Object.assign(combineRefProps(useAppliedFeature), {
        displayName: 'ApplyFeaturesContext(' + ((useFeature as any).displayName || (useFeature as any).name) + ')',
      });
    }

    Object.assign(useAppliedFeature, {
      displayName: 'ApplyFeaturesContext(' + ((useFeature as any).displayName || (useFeature as any).name) + ')',
    });

    return useAppliedFeature;
  }

  return applyFeaturesContext;
}

export default createFeaturesContextApplier;
