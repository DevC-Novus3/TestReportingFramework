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

            // Build query string from filters using & instead of ?
            var queryParams = new List<string>();
            foreach (var filter in request.Filters)
            {
                queryParams.Add($"{filter.FilterName}={Uri.EscapeDataString(filter.FilterValue)}");
            }
            
            if (queryParams.Any())
            {
                endpoint += "&" + string.Join("&", queryParams);
            }

            var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
            _logger.LogInformation($"Fetching data from Node-RED: {fullUrl}");

            try
            {
                var response = await _httpClient.GetAsync(endpoint);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Node-RED returned {response.StatusCode}: {errorContent}");
                    
                    // Parse error to identify which filter caused the issue
                    var invalidFilters = request.Filters
                        .Where(f => errorContent.Contains(f.FilterName) || errorContent.Contains(f.FilterValue))
                        .Select(f => $"{f.FilterName}='{f.FilterValue}'")
                        .ToList();
                    
                    if (invalidFilters.Any())
                    {
                        throw new InvalidOperationException($"Invalid filter value(s): {string.Join(", ", invalidFilters)}. Please check your filter values and try again.");
                    }
                    else
                    {
                        throw new InvalidOperationException($"Failed to load data. The API returned an error. Please check your filter values.");
                    }
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<Dictionary<string, object>>();

                // No need to extract filter values since we're pre-filtering
                return new NodeRedData
                {
                    Data = data.FirstOrDefault() ?? new Dictionary<string, object>(),
                    AvailableFields = data.FirstOrDefault()?.Keys.ToList() ?? new List<string>(),
                    AvailableFilterValues = new Dictionary<string, List<string>>() // Empty since we're pre-filtering
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error when fetching data from Node-RED");
                throw new InvalidOperationException("Failed to connect to data source. Please check your connection and try again.", ex);
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw our custom exceptions
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error when fetching data from Node-RED");
                throw new InvalidOperationException("An unexpected error occurred while loading data. Please try again.", ex);
            }
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

            // Build query string from filters using & instead of ?
            var queryParams = new List<string>();
            foreach (var filter in request.Filters)
            {
                queryParams.Add($"{filter.FilterName}={Uri.EscapeDataString(filter.FilterValue)}");
            }
            
            if (queryParams.Any())
            {
                endpoint += "&" + string.Join("&", queryParams);
            }

            var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
            _logger.LogInformation($"Fetching bulk data from Node-RED: {fullUrl}");

            try
            {
                var response = await _httpClient.GetAsync(endpoint);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Node-RED returned {response.StatusCode}: {errorContent}");
                    
                    var invalidFilters = request.Filters
                        .Where(f => errorContent.Contains(f.FilterName) || errorContent.Contains(f.FilterValue))
                        .Select(f => $"{f.FilterName}='{f.FilterValue}'")
                        .ToList();
                    
                    if (invalidFilters.Any())
                    {
                        throw new InvalidOperationException($"Invalid filter value(s): {string.Join(", ", invalidFilters)}. Please check your filter values and try again.");
                    }
                    else
                    {
                        throw new InvalidOperationException($"Failed to load data. The API returned an error. Please check your filter values.");
                    }
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                var allData = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<Dictionary<string, object>>();

                return allData;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error when fetching bulk data from Node-RED");
                throw new InvalidOperationException("Failed to connect to data source. Please check your connection and try again.", ex);
            }
            catch (InvalidOperationException)
            {
                throw; // Re-throw our custom exceptions
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error when fetching bulk data from Node-RED");
                throw new InvalidOperationException("An unexpected error occurred while loading data. Please try again.", ex);
            }
        }
    }
}