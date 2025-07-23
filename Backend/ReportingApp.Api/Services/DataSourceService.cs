using ReportingApp.Api.Models;
using Microsoft.Extensions.Configuration;

namespace ReportingApp.Api.Services
{
    public class DataSourceService
    {
        private readonly IConfiguration _configuration;
        private readonly List<DataSource> _dataSources;

        public DataSourceService(IConfiguration configuration)
        {
            _configuration = configuration;
            _dataSources = _configuration.GetSection("DataSources").Get<List<DataSource>>() ?? new List<DataSource>();
        }

        public List<DataSource> GetAllDataSources()
        {
            return _dataSources;
        }

        public List<string> GetCategories()
        {
            return _dataSources.Select(ds => ds.Category).Distinct().ToList();
        }

        public List<DataSource> GetDataSourcesByCategory(string category)
        {
            return _dataSources.Where(ds => ds.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        public DataSource? GetDataSourceById(string id)
        {
            return _dataSources.FirstOrDefault(ds => ds.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        }
    }
}