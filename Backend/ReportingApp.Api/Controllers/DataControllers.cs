using Microsoft.AspNetCore.Mvc;
using ReportingApp.Api.Services;
using ReportingApp.Api.Models;

namespace ReportingApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly NodeRedService _nodeRedService;
        private readonly ILogger<DataController> _logger;

        public DataController(NodeRedService nodeRedService, ILogger<DataController> logger)
        {
            _nodeRedService = nodeRedService;
            _logger = logger;
        }

        [HttpGet("schema/{*endpoint}")]
        public async Task<IActionResult> GetDataSchema(string endpoint)
        {
            try
            {
                if (!endpoint.StartsWith("/"))
                    endpoint = "/" + endpoint;
                    
                var data = await _nodeRedService.GetDataSchemaAsync(endpoint);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data schema");
                return StatusCode(500, new { error = "Failed to fetch data schema", details = ex.Message });
            }
        }

        [HttpGet("data/{*endpoint}")]
        public async Task<IActionResult> GetData(string endpoint)
        {
            try
            {
                if (!endpoint.StartsWith("/"))
                    endpoint = "/" + endpoint;
                    
                var data = await _nodeRedService.GetBulkDataAsync(endpoint);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data");
                return StatusCode(500, new { error = "Failed to fetch data", details = ex.Message });
            }
        }

        [HttpGet("test-nodered")]
        public async Task<IActionResult> TestNodeRed()
        {
            try
            {
                using var client = new HttpClient();
                var response = await client.GetAsync("http://localhost:1880/api/sensor-data");
                var content = await response.Content.ReadAsStringAsync();
                return Ok(new { 
                    statusCode = response.StatusCode,
                    isSuccess = response.IsSuccessStatusCode,
                    content = content.Substring(0, Math.Min(content.Length, 500)), // First 500 chars
                    url = "http://localhost:1880/api/sensor-data",
                    headers = response.Headers.ToString()
                });
            }
            catch (Exception ex)
            {
                return Ok(new { error = ex.Message, type = ex.GetType().Name });
            }
        }
    }
}