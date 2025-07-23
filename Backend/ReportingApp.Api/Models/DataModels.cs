namespace ReportingApp.Api.Models
{
    public class NodeRedData
    {
        public Dictionary<string, object> Data { get; set; } = new();
        public List<string> AvailableFields { get; set; } = new();
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