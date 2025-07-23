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
        private readonly DataSourceService _dataSourceService;
        private readonly ILogger<DataController> _logger;

        public DataController(NodeRedService nodeRedService, DataSourceService dataSourceService, ILogger<DataController> logger)
        {
            _nodeRedService = nodeRedService;
            _dataSourceService = dataSourceService;
            _logger = logger;
        }

        [HttpGet("sources")]
        public IActionResult GetDataSources()
        {
            var sources = _dataSourceService.GetAllDataSources();
            return Ok(sources);
        }

        [HttpGet("sources/categories")]
        public IActionResult GetCategories()
        {
            var categories = _dataSourceService.GetCategories();
            return Ok(categories);
        }

        [HttpGet("sources/category/{category}")]
        public IActionResult GetDataSourcesByCategory(string category)
        {
            var sources = _dataSourceService.GetDataSourcesByCategory(category);
            return Ok(sources);
        }

        [HttpPost("schema")]
        public async Task<IActionResult> GetDataSchema([FromBody] DataSourceRequest request)
        {
            try
            {
                var data = await _nodeRedService.GetDataWithFiltersAsync(request);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data schema");
                return StatusCode(500, new { error = "Failed to fetch data schema", details = ex.Message });
            }
        }

        [HttpPost("data")]
        public async Task<IActionResult> GetData([FromBody] DataSourceRequest request)
        {
            try
            {
                var data = await _nodeRedService.GetBulkDataWithFiltersAsync(request);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data");
                return StatusCode(500, new { error = "Failed to fetch data", details = ex.Message });
            }
        }
    }
}