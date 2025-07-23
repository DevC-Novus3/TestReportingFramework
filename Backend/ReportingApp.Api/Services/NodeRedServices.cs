using System.Text.Json;
using ReportingApp.Api.Models;

namespace ReportingApp.Api.Services
{
    public class NodeRedService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NodeRedService> _logger;

        public NodeRedService(HttpClient httpClient, IConfiguration configuration, ILogger<NodeRedService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            
            var baseUrl = _configuration["NodeRed:BaseUrl"] ?? "http://localhost:1880";
            _logger.LogInformation($"NodeRed BaseUrl configured as: {baseUrl}");
            
            // Make sure base URL ends with /
            if (!baseUrl.EndsWith("/"))
                baseUrl += "/";
                
            _httpClient.BaseAddress = new Uri(baseUrl);
            _logger.LogInformation($"HttpClient BaseAddress set to: {_httpClient.BaseAddress}");
        }

        public async Task<NodeRedData> GetDataSchemaAsync(string endpoint)
        {
            try
            {
                // Clean up the endpoint
                if (endpoint.StartsWith("/"))
                    endpoint = endpoint.Substring(1);
                    
                var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
                _logger.LogInformation($"Attempting to fetch from Node-RED: {fullUrl}");
                
                var response = await _httpClient.GetAsync(endpoint);
                
                _logger.LogInformation($"Response status: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Node-RED error response: {errorContent}");
                }
                
                response.EnsureSuccessStatusCode();

                var jsonString = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Received data length: {jsonString.Length} characters");
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var data = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, options);

                if (data == null || !data.Any())
                {
                    return new NodeRedData();
                }

                return new NodeRedData
                {
                    Data = data.First(),
                    AvailableFields = data.First().Keys.ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching data schema from Node-RED for endpoint: {endpoint}");
                throw;
            }
        }

        public async Task<List<Dictionary<string, object>>> GetBulkDataAsync(string endpoint)
        {
            try
            {
                // Clean up the endpoint
                if (endpoint.StartsWith("/"))
                    endpoint = endpoint.Substring(1);
                    
                var fullUrl = new Uri(_httpClient.BaseAddress, endpoint).ToString();
                _logger.LogInformation($"Attempting to fetch bulk data from Node-RED: {fullUrl}");
                
                var response = await _httpClient.GetAsync(endpoint);
                response.EnsureSuccessStatusCode();

                var jsonString = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                return JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonString, options) ?? new List<Dictionary<string, object>>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bulk data from Node-RED");
                throw;
            }
        }
    }
}