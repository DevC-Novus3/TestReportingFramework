using System.Text.Json;
using ReportingApp.Api.Models;

namespace ReportingApp.Api.Services
{
    public class NodeRedService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NodeRedService> _logger;
        private readonly DataSourceService _dataSourceService;

        public NodeRedService(HttpClient httpClient, IConfiguration configuration, 
            ILogger<NodeRedService> logger, DataSourceService dataSourceService)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _dataSourceService = dataSourceService;
            
            var baseUrl = _configuration["NodeRed:BaseUrl"] ?? "http://localhost:1880";
            _logger.LogInformation($"NodeRed BaseUrl configured as: {baseUrl}");
            
            if (!baseUrl.EndsWith("/"))
                baseUrl += "/";
                
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        public async Task<NodeRedData> GetDataWithFiltersAsync(DataSourceRequest request)
        {
            var dataSource = _dataSourceService.GetDataSourceById(request.DataSourceId);
            if (dataSource == null)
            {
                throw new ArgumentException($"Data source with ID '{request.DataSourceId}' not found");
            }

            var endpoint = dataSource.NodeRedEndpoint;
            if (endpoint.StartsWith("/"))
                endpoint = endpoint.Substring(1);

            // Build query string from filters
            var queryParams = new List<string>();
            foreach (var filter in request.Filters)
            {
                queryParams.Add($"{filter.FilterName}={Uri.EscapeDataString(filter.FilterValue)}");
            }
            
            if (queryParams.Any())
            {
                endpoint += "?" + string.Join("&", queryParams);
            }

            var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
            _logger.LogInformation($"Fetching data from Node-RED: {fullUrl}");

            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new List<Dictionary<string, object>>();

            // Extract available filter values from the data
            var filterValues = new Dictionary<string, List<string>>();
            foreach (var filterName in dataSource.AvailableFilters)
            {
                var values = data
                    .Where(row => row.ContainsKey(filterName))
                    .Select(row => row[filterName]?.ToString() ?? "")
                    .Where(val => !string.IsNullOrEmpty(val))
                    .Distinct()
                    .OrderBy(val => val)
                    .ToList();
                
                if (values.Any())
                {
                    filterValues[filterName] = values;
                }
            }

            return new NodeRedData
            {
                Data = data.FirstOrDefault() ?? new Dictionary<string, object>(),
                AvailableFields = data.FirstOrDefault()?.Keys.ToList() ?? new List<string>(),
                AvailableFilterValues = filterValues
            };
        }

        public async Task<List<Dictionary<string, object>>> GetBulkDataWithFiltersAsync(DataSourceRequest request)
        {
            var dataSource = _dataSourceService.GetDataSourceById(request.DataSourceId);
            if (dataSource == null)
            {
                throw new ArgumentException($"Data source with ID '{request.DataSourceId}' not found");
            }

            var endpoint = dataSource.NodeRedEndpoint;
            if (endpoint.StartsWith("/"))
                endpoint = endpoint.Substring(1);

            // Build query string from filters
            var queryParams = new List<string>();
            foreach (var filter in request.Filters)
            {
                queryParams.Add($"{filter.FilterName}={Uri.EscapeDataString(filter.FilterValue)}");
            }
            
            if (queryParams.Any())
            {
                endpoint += "?" + string.Join("&", queryParams);
            }

            var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
            _logger.LogInformation($"Fetching bulk data from Node-RED: {fullUrl}");

            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            var allData = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new List<Dictionary<string, object>>();

            // Apply filters on the client side if Node-RED doesn't support query params
            var filteredData = allData;
            foreach (var filter in request.Filters)
            {
                filteredData = filteredData.Where(row => 
                    row.ContainsKey(filter.FilterName) && 
                    row[filter.FilterName]?.ToString() == filter.FilterValue
                ).ToList();
            }

            return filteredData;
        }
    }
}