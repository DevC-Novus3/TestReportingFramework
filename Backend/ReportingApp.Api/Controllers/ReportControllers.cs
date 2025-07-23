using Microsoft.AspNetCore.Mvc;
using ReportingApp.Api.Services;
using ReportingApp.Api.Models;

namespace ReportingApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ReportGeneratorService _reportGenerator;
        private readonly ILogger<ReportController> _logger;

        public ReportController(ReportGeneratorService reportGenerator, ILogger<ReportController> logger)
        {
            _reportGenerator = reportGenerator;
            _logger = logger;
        }

        [HttpPost("generate")]
        public IActionResult GenerateReport([FromBody] ReportRequest request)
        {
            try
            {
                if (request == null || request.SelectedFields.Count == 0)
                {
                    return BadRequest("No fields selected for report");
                }

                byte[] fileContent;
                string contentType;
                string fileName;

                switch (request.ReportType.ToLower())
                {
                    case "excel":
                        fileContent = _reportGenerator.GenerateExcelReport(request);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName = $"report_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                        break;
                    case "word":
                        fileContent = _reportGenerator.GenerateWordReport(request);
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        fileName = $"report_{DateTime.Now:yyyyMMddHHmmss}.docx";
                        break;
                    default:
                        return BadRequest("Invalid report type. Use 'excel' or 'word'");
                }

                return File(fileContent, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                return StatusCode(500, new { error = "Failed to generate report", details = ex.Message });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Report API is working", timestamp = DateTime.Now });
        }
    }
}