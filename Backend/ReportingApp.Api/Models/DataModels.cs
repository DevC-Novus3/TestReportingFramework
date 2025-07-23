namespace ReportingApp.Api.Models
{
    public class DataSource
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public string NodeRedEndpoint { get; set; } = "";
        public List<string> AvailableFilters { get; set; } = new();
    }

    public class DataSourceFilter
    {
        public string FilterName { get; set; } = "";
        public string FilterValue { get; set; } = "";
    }

    public class DataSourceRequest
    {
        public string DataSourceId { get; set; } = "";
        public List<DataSourceFilter> Filters { get; set; } = new();
    }

    public class NodeRedData
    {
        public Dictionary<string, object> Data { get; set; } = new();
        public List<string> AvailableFields { get; set; } = new();
        public Dictionary<string, List<string>> AvailableFilterValues { get; set; } = new();
    }

    public class ReportRequest
    {
        public string ReportType { get; set; } = "excel";
        public List<string> SelectedFields { get; set; } = new();
        public List<Dictionary<string, object>> Data { get; set; } = new();
        public ReportConfiguration Configuration { get; set; } = new();
    }

    public class ReportConfiguration
    {
        public string Title { get; set; } = "Report";
        public Dictionary<string, string> FieldMappings { get; set; } = new();
        public List<ChartConfiguration> Charts { get; set; } = new();
    }

    public class ChartConfiguration
    {
        public string Type { get; set; } = "bar";
        public string XAxis { get; set; } = "";
        public string YAxis { get; set; } = "";
        public string Title { get; set; } = "";
    }
}