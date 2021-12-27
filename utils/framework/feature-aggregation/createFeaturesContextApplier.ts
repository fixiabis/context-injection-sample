import React from 'react';
import { extendComponent } from '../component';
import { ConvertToFeatures, FeatureSource, FindPossibleDependencyKeys, UnknownFeatureParams } from './type';
import useFeaturesContextRoot from './createFeaturesContextHook';
import createFeaturesContextHook from './createFeaturesContextHook';

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
  FeaturesContext: React.Context<ConvertToFeatures<TFeatureParams>>
) {
  const useFeaturesContext = createFeaturesContextHook(FeaturesContext);

  function applyFeaturesContext<TFeatureSource extends FeatureSource>(
    featureSource: TFeatureSource & { displayName?: string },
    dependencyKeys: FindPossibleDependencyKeys<TFeatureParams, Parameters<TFeatureSource>>,
    isRefNeeded: boolean = false
  ) {
    function useAppliedFeature(
      props: any,
      ref?: React.Ref<any>,
      features?: ConvertToFeatures<TFeatureParams>
    ): ReturnType<TFeatureSource> {
      if (!features || !features.__isFeaturesRoot) {
        features = useFeaturesContext(props, ref);
      }

      const dependencies = dependencyKeys.map(useDependencySolver(features, props, ref));
      return featureSource(...dependencies);
    }

    extendComponent(useAppliedFeature as React.ElementType, featureSource);

    if (isRefNeeded) {
      const FeatureAppliedComponent = React.forwardRef(
        useAppliedFeature as React.ForwardRefRenderFunction<any, Parameters<typeof useAppliedFeature>[1]>
      );

      extendComponent(FeatureAppliedComponent, useAppliedFeature as React.ElementType);
      return FeatureAppliedComponent;
    }

    return useAppliedFeature;
  }

  return applyFeaturesContext;
}

export default createFeaturesContextApplier;