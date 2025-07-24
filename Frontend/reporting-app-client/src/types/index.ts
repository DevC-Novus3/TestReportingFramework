export interface DataSource {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeRedEndpoint: string;
  availableFilters: string[];
}

export interface DataSourceFilter {
  filterName: string;
  filterValue: string;
}

export interface DataSourceRequest {
  dataSourceId: string;
  filters: DataSourceFilter[];
}

export interface NodeRedData {
  data: Record<string, any>;
  availableFields: string[];
  availableFilterValues: Record<string, string[]>;
}

export interface ReportRequest {
  reportType: 'excel' | 'word';
  selectedFields: string[];
  data: Record<string, any>[];
  configuration: ReportConfiguration;
}

export interface ReportConfiguration {
  title: string;
  fieldMappings: Record<string, string>;
  charts: ChartConfiguration[];
}

export interface ChartConfiguration {
  type: 'bar' | 'line' | 'pie';
  xAxis: string;
  yAxis: string;
  title: string;
}

export interface DragItem {
  field: string;
  type: string;
}