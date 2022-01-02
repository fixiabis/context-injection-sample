import useCustomerStore from './useCustomerStore';
import useCustomerService from './useCustomerService';
import useCustomerTableFeature from './useCustomerTableFeature';
import CustomerTable from './CustomerTable';
import CustomerManagementSection from './CustomerManagementSection';
import CustomerEditPanel from './CustomerEditPanel';
import useCustomerEditingService from './useCustomerEditingService';
import useCustomerEditPanelFeature from './useCustomerEditPanelFeature';
import { extendClassNameProp } from '../../utils/framework/component';
import FeatAggr, { FeatureSource } from '../../utils/framework/feature-aggregation/FeatAggr';

const useCustomerManagementSectionProps = FeatAggr.createContextInjectionHook({
  Table: 'BorderedCustomerTable',
});

const useCustomerManagementTemplateProps = FeatAggr.createContextInjectionHook({
  Section: 'CustomerManagementSection',
  EditPanel: 'FeatureAppliedCustomerEditPanel',
});

const BorderedCustomerTable = extendClassNameProp(CustomerTable, 'CustomerTable--bordered');

const useInjectedCustomerEditPanelFeature = FeatAggr.createContextApplier(() => CustomerManagementContext)(
  useCustomerEditPanelFeature,
  ['useProps', 'useCustomerStore', 'useCustomerEditingService']
);

const applyCustomerEditPanelFeature = FeatAggr.createHookApplier(useInjectedCustomerEditPanelFeature);

const FeatureAppliedCustomerEditPanel = applyCustomerEditPanelFeature(CustomerEditPanel) as FeatureSource;

const CustomerManagementContext = FeatAggr.createContext({
  useCustomerStore: [useCustomerStore],
  useCustomerService: [useCustomerService, 'useCustomerStore'],
  useCustomerEditingService: [useCustomerEditingService, 'useCustomerStore'],
  useCustomerTableFeature: [
    useCustomerTableFeature,
    'usePropsWithRef',
    'useCustomerService',
    'useCustomerEditingService',
  ],
  useCustomerEditPanelFeature: [
    useCustomerEditPanelFeature,
    'useProps',
    'useCustomerStore',
    'useCustomerEditingService',
  ],
  useCustomerManagementSectionProps: [useCustomerManagementSectionProps, 'useProps', 'useContext'],
  useCustomerManagementTemplateProps: [useCustomerManagementTemplateProps, 'useProps', 'useContext'],
  CustomerTable: [CustomerTable, 'useCustomerTableFeature'],
  CustomerEditPanel: [CustomerEditPanel, 'useCustomerEditPanelFeature'],
  CustomerManagementSection: [CustomerManagementSection, 'useCustomerManagementSectionProps'],

  FeatureAppliedCustomerEditPanel: [FeatureAppliedCustomerEditPanel, 'useProps'],
  BorderedCustomerTable: [BorderedCustomerTable, 'useCustomerTableFeature'],
});

export const applyCustomerManagement = FeatAggr.createContextApplier(CustomerManagementContext);

export const shareCustomerManagement = FeatAggr.createContextSharer(CustomerManagementContext);

export default CustomerManagementContext;
